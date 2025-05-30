"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("../../utils/constants");
const enums_1 = require("../../utils/enums");
const hashPassword_1 = require("../../utils/hashPassword");
const httpError_1 = require("../../utils/httpError");
const sendmail_1 = require("../../utils/sendmail");
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserService {
    constructor(_userRepository, _savedCandidatesRepository, _candidatesRepository) {
        this._userRepository = _userRepository;
        this._savedCandidatesRepository = _savedCandidatesRepository;
        this._candidatesRepository = _candidatesRepository;
    }
    register(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userFound = yield this._userRepository.findOne({ $or: [{ email: payload === null || payload === void 0 ? void 0 : payload.email }, { mobile: payload === null || payload === void 0 ? void 0 : payload.mobile }] });
                if (userFound) {
                    throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_FAILED_TO_CREATED, enums_1.StatusCode.BAD_REQUEST);
                }
                const hashedPassword = yield (0, hashPassword_1.hashPassword)(payload.password);
                const otp = Math.floor(100000 + Math.random() * 900000);
                const otpExpiry = new Date(Date.now() + 60 * 1000);
                const response = yield this._userRepository.create(Object.assign(Object.assign({}, payload), { password: hashedPassword, otp,
                    otpExpiry }));
                yield (0, sendmail_1.sendEmail)({
                    to: response.email,
                    subject: 'SKILL-SYNC - OTP Verification',
                    otp: String(otp),
                });
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const id = response._id;
                        const foundUser = yield this._userRepository.findById(id);
                        if (foundUser && !foundUser.isVerified && foundUser.otpExpiry && foundUser.otpExpiry.getTime() < Date.now()) {
                            const updatedId = foundUser._id;
                            yield this._userRepository.delete(updatedId);
                            console.log(`User with email ${foundUser.email} deleted due to expired OTP.`);
                        }
                    }
                    catch (cleanupError) {
                        console.error('Error during OTP expiry cleanup:', cleanupError);
                    }
                }), 60000);
                return response;
            }
            catch (error) {
                console.error('Error creating candidate:', error);
                throw error;
            }
        });
    }
    login(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userFound = yield this._userRepository.findOne({ email: payload === null || payload === void 0 ? void 0 : payload.email });
                if (!userFound) {
                    throw new httpError_1.HttpError(constants_1.UserErrorMessages.INVALID_CREDENTIALS, enums_1.StatusCode.UNAUTHORIZED);
                }
                if (!userFound.status) {
                    throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_BLOCKED, enums_1.StatusCode.UNAUTHORIZED);
                }
                if (!(userFound === null || userFound === void 0 ? void 0 : userFound.password)) {
                    throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_FAILED_TO_LOGGIN, enums_1.StatusCode.UNAUTHORIZED);
                }
                const isMatch = yield bcrypt_1.default.compare(payload.password, userFound.password);
                if (!isMatch) {
                    throw new httpError_1.HttpError(constants_1.UserErrorMessages.INVALID_CREDENTIALS, enums_1.StatusCode.UNAUTHORIZED);
                }
                return userFound;
            }
            catch (error) {
                throw error;
            }
        });
    }
    getUserWithEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._userRepository.findOne({ email });
            if (response) {
                return response;
            }
            else {
                return null;
            }
        });
    }
    googleAuth(email, name, picture, role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email || !name || !picture) {
                throw new httpError_1.HttpError('Something went wrong', enums_1.StatusCode.BAD_REQUEST);
            }
            const data = { email, name, profile: picture };
            const existing = yield this._userRepository.findOne({ email });
            if (existing) {
                if (existing && (existing === null || existing === void 0 ? void 0 : existing.status) === false) {
                    throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_BLOCKED, enums_1.StatusCode.BAD_REQUEST);
                }
                const userId = existing._id;
                const user = yield this._userRepository.update(userId, { email: data === null || data === void 0 ? void 0 : data.email, isVerified: true });
                return { isExist: true, user };
            }
            else {
                const user = yield this._userRepository.create(Object.assign(Object.assign({}, data), { role, isVerified: true }));
                return { isExist: false, user };
            }
        });
    }
    otpVerify(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, otp } = payload;
            if (!id || !otp) {
                throw new httpError_1.HttpError('Id and OTP are required', enums_1.StatusCode.BAD_REQUEST);
            }
            const existing = yield this._userRepository.findById(id);
            if (!existing) {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_REGISTER, enums_1.StatusCode.BAD_REQUEST);
            }
            if (existing.otpExpiry && new Date() > new Date(existing.otpExpiry)) {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.OTP_EXPIRED, enums_1.StatusCode.BAD_REQUEST);
            }
            if (Number(otp) !== Number(existing.otp)) {
                throw new httpError_1.HttpError(constants_1.OTPErrorMessages.INCORRECT_OTP, enums_1.StatusCode.BAD_REQUEST);
            }
            yield this._userRepository.updateNull(id, {
                otp: null,
                otpExpiry: null,
                isVerified: true,
            });
            return yield this._userRepository.findById(id);
        });
    }
    forgotEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const userFound = yield this._userRepository.findOne({ email });
            if (!userFound) {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_FOUND, enums_1.StatusCode.BAD_REQUEST);
            }
            const forgotOtp = Math.floor(100000 + Math.random() * 900000);
            const forgotOtpExpiry = new Date(Date.now() + 5 * 60 * 1000);
            const updatedUser = yield this._userRepository.update(userFound._id, {
                forgotOtp,
                forgotOtpExpiry,
            });
            if (!updatedUser) {
                throw new httpError_1.HttpError('Failed to update user with forgot OTP.', enums_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
            yield (0, sendmail_1.sendEmail)({
                to: updatedUser.email,
                subject: 'SKILL-SYNC - FORGOT OTP Verification',
                otp: String(forgotOtp),
            });
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    const foundUser = yield this._userRepository.findById(updatedUser._id);
                    if (foundUser && foundUser.forgotOtpExpiry && foundUser.forgotOtpExpiry.getTime() < Date.now()) {
                        yield this._userRepository.updateNull(foundUser._id, { forgotOtpExpiry: null, forgotOtp: null });
                        console.log(`User with email ${foundUser.email} forgot OTP cleared after expiry.`);
                    }
                }
                catch (cleanupError) {
                    console.error('Error during OTP expiry cleanup:', cleanupError);
                }
            }), 5 * 60 * 1000);
            return updatedUser;
        });
    }
    resetOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const userFound = yield this._userRepository.findOne({ email });
            if (!userFound) {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_FOUND, enums_1.StatusCode.BAD_REQUEST);
            }
            const otp = Math.floor(100000 + Math.random() * 900000);
            const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
            const updatedUser = yield this._userRepository.update(userFound._id, {
                otp,
                otpExpiry,
            });
            if (!updatedUser) {
                throw new httpError_1.HttpError('Failed to update user with  OTP.', enums_1.StatusCode.INTERNAL_SERVER_ERROR);
            }
            yield (0, sendmail_1.sendEmail)({
                to: updatedUser.email,
                subject: 'SKILL-SYNC - OTP Verification',
                otp: String(otp),
            });
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    const id = updatedUser._id;
                    const foundUser = yield this._userRepository.findById(id);
                    if (foundUser && !foundUser.isVerified && foundUser.otpExpiry && foundUser.otpExpiry.getTime() < Date.now()) {
                        const updatedId = foundUser._id;
                        yield this._userRepository.delete(updatedId);
                        console.log(`User with email ${foundUser.email} deleted due to expired OTP.`);
                    }
                }
                catch (cleanupError) {
                    console.error('Error during OTP expiry cleanup:', cleanupError);
                }
            }), 60000);
            return updatedUser;
        });
    }
    forgotOtpVerify(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, otp } = payload;
            if (!id || !otp) {
                throw new httpError_1.HttpError('Id and OTP are required', enums_1.StatusCode.BAD_REQUEST);
            }
            const existing = yield this._userRepository.findById(id);
            if (!existing) {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_REGISTER, enums_1.StatusCode.BAD_REQUEST);
            }
            if (existing.forgotOtpExpiry && new Date() > new Date(existing.forgotOtpExpiry)) {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.OTP_EXPIRED, enums_1.StatusCode.BAD_REQUEST);
            }
            if (Number(otp) !== Number(existing.forgotOtp)) {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_WRONG_OTP, enums_1.StatusCode.BAD_REQUEST);
            }
            yield this._userRepository.updateNull(id, {
                forgotOtp: null,
                forgotOtpExpiry: null
            });
            return yield this._userRepository.findById(id);
        });
    }
    resetPassword(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._userRepository.findById(payload === null || payload === void 0 ? void 0 : payload.id);
            if (response) {
                const hashedPassword = yield (0, hashPassword_1.hashPassword)(payload.password);
                const updated = yield this._userRepository.update(payload === null || payload === void 0 ? void 0 : payload.id, { password: hashedPassword });
                return updated;
            }
            else {
                return null;
            }
        });
    }
    getAllEmployees(page, pageSize, querys) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * pageSize;
            const filter = { role: enums_1.Roles.EMPLOYEE };
            if (querys) {
                filter.name = { $regex: querys, $options: 'i' };
            }
            const employees = yield this._userRepository.findAll(filter, skip, pageSize);
            const totalEmployees = yield this._userRepository.countDocuments(filter);
            if (employees) {
                return { employees, totalEmployees };
            }
            else {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    getAllCandidates(page, pageSize, querys) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * pageSize;
            const filter = { role: enums_1.Roles.CANDIDATE };
            if (querys) {
                filter.name = { $regex: querys, $options: 'i' };
            }
            const candidates = yield this._userRepository.findAll(filter, skip, pageSize);
            const totalCandidates = yield this._userRepository.countDocuments(filter);
            if (candidates) {
                return { candidates, totalCandidates };
            }
            else {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    toggleStatus(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!payload) {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.INVALID_PAYLOAD, enums_1.StatusCode.BAD_REQUEST);
            }
            let response = null;
            if (payload.role === enums_1.Roles.CANDIDATE) {
                response = yield this._userRepository.update(payload.id, { status: payload.status });
            }
            else if (payload.role === enums_1.Roles.EMPLOYEE) {
                response = yield this._userRepository.update(payload.id, { status: payload.status });
            }
            if (response) {
                return true;
            }
            else {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    togglePostStatus(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!payload) {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.INVALID_PAYLOAD, enums_1.StatusCode.BAD_REQUEST);
            }
            let response = null;
            response = yield this._userRepository.update(payload.id, { hasAiAccess: payload.status });
            if (response) {
                return true;
            }
            else {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    saveCandidate(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = new mongoose_1.Types.ObjectId(payload.userId);
            const candidateId = new mongoose_1.Types.ObjectId(payload.candidateId);
            const existing = yield this._savedCandidatesRepository.findOne({
                userId,
                userRole: payload.userRole,
                candidateId,
            });
            if (existing) {
                if (existing.isDeleted) {
                    yield this._savedCandidatesRepository.update(existing._id, { isDeleted: false });
                    return true;
                }
                // Already exists and not deleted, don't create duplicate
                return true;
            }
            const response = yield this._savedCandidatesRepository.create({
                userId,
                userRole: payload.userRole,
                candidateId,
            });
            if (response) {
                return true;
            }
            else {
                throw new httpError_1.HttpError(constants_1.PostErrorMessages.POST_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    removeSavedCandidate(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._savedCandidatesRepository.update(id, { isDeleted: true });
            if (response) {
                return true;
            }
            else {
                throw new httpError_1.HttpError(constants_1.PostErrorMessages.POST_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    getSavedCandidates(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (payload.page - 1) * payload.pageSize;
            const filter = {
                userId: new mongoose_1.Types.ObjectId(payload.id),
                userRole: payload.role,
                isDeleted: false,
            };
            const savedCandidates = yield this._savedCandidatesRepository.findAll(filter, skip, payload.pageSize);
            const totalCandidates = yield this._savedCandidatesRepository.countDocuments(filter);
            if (!savedCandidates || savedCandidates.length === 0) {
                return { candidates: [], totalCandidates: 0 };
            }
            const candidateIds = savedCandidates.map((saved) => saved.candidateId);
            let candidateProfiles = yield this._candidatesRepository.findAll({ _id: { $in: candidateIds } });
            if (payload.querys) {
                const queryRegex = new RegExp(payload.querys, 'i');
                candidateProfiles = candidateProfiles.filter((candidate) => queryRegex.test(candidate.name));
            }
            // Create a map for fast lookup
            const savedCandidateMap = new Map(savedCandidates.map((saved) => [saved.candidateId.toString(), saved._id.toString()]));
            // Attach savedCandidateId to each candidate
            const candidatesWithSavedId = candidateProfiles.map((candidate) => {
                var _a, _b;
                return (Object.assign(Object.assign({}, (_b = (_a = candidate.toObject) === null || _a === void 0 ? void 0 : _a.call(candidate)) !== null && _b !== void 0 ? _b : candidate), { savedCandidateId: savedCandidateMap.get(candidate._id.toString()) || '' }));
            });
            return {
                candidates: candidatesWithSavedId,
                totalCandidates,
            };
        });
    }
}
exports.UserService = UserService;
