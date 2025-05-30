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
exports.UserController = void 0;
const constants_1 = require("../../utils/constants");
const enums_1 = require("../../utils/enums");
const generateTokens_1 = require("../../utils/generateTokens");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class UserController {
    constructor(_userService) {
        this._userService = _userService;
    }
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const response = yield this._userService.register(payload);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    message: constants_1.UserSuccessMessages.USER_CREATED,
                    user: response,
                });
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const user = yield this._userService.login(payload);
                if (user) {
                    const tokens = (0, generateTokens_1.generateTokens)({
                        id: user._id,
                        role: user.role,
                    });
                    res
                        .cookie(`${user.role}Token`, tokens.accessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 15 * 60 * 1000, // 15 minutes
                    })
                        .cookie('refreshToken', tokens.refreshToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 7 * 24 * 60 * 60 * 1000,
                    })
                        .status(enums_1.StatusCode.OK)
                        .json({
                        success: true,
                        message: constants_1.UserSuccessMessages.USER_LOGGINED,
                        user,
                        token: tokens.accessToken
                    });
                }
                else {
                    res.status(enums_1.StatusCode.UNAUTHORIZED).json({
                        success: false,
                        message: 'Invalid credentials',
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    getUserWithEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const email = req.params.email;
                const response = yield this._userService.getUserWithEmail(email);
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        response,
                    });
                }
                else {
                    res.status(enums_1.StatusCode.BAD_REQUEST).json({
                        success: false
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    otpVerify(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const response = yield this._userService.otpVerify(payload);
                if (response) {
                    const tokens = (0, generateTokens_1.generateTokens)({
                        id: response === null || response === void 0 ? void 0 : response._id,
                        role: response === null || response === void 0 ? void 0 : response.role,
                    });
                    res
                        .cookie(`${response.role}Token`, tokens.accessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 15 * 60 * 1000, // 15 minutes
                    })
                        .cookie('refreshToken', tokens.refreshToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 7 * 24 * 60 * 60 * 1000,
                    })
                        .status(enums_1.StatusCode.OK)
                        .json({
                        success: true,
                        message: constants_1.OTPSuccessMessages.OTP_VERIFIED,
                        user: response,
                        token: tokens.accessToken
                    });
                }
                else {
                    res.status(enums_1.StatusCode.BAD_REQUEST).json({
                        success: false
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    forgotEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const email = req.params.email;
                const response = yield this._userService.forgotEmail(email);
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        message: constants_1.OTPSuccessMessages.FORGOT_OTP_SENDED,
                        user: response,
                    });
                }
                else {
                    res.status(enums_1.StatusCode.BAD_REQUEST).json({
                        success: false
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    resetOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const email = req.params.email;
                const response = yield this._userService.resetOtp(email);
                const tokens = (0, generateTokens_1.generateTokens)({
                    id: response === null || response === void 0 ? void 0 : response._id,
                    role: response === null || response === void 0 ? void 0 : response.role,
                });
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        message: constants_1.OTPSuccessMessages.OTP_RESEND,
                        user: response,
                        token: tokens === null || tokens === void 0 ? void 0 : tokens.accessToken
                    });
                }
                else {
                    res.status(enums_1.StatusCode.BAD_REQUEST).json({
                        success: false
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    forgotOtpVerify(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const response = yield this._userService.forgotOtpVerify(payload);
                const tokens = (0, generateTokens_1.generateTokens)({
                    id: response === null || response === void 0 ? void 0 : response._id,
                    role: response === null || response === void 0 ? void 0 : response.role,
                });
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        message: constants_1.OTPSuccessMessages.FORGOT_OTP_SENDED,
                        user: response,
                        token: tokens.accessToken
                    });
                }
                else {
                    res.status(enums_1.StatusCode.BAD_REQUEST).json({
                        success: false
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const response = yield this._userService.resetPassword(payload);
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        message: constants_1.UserSuccessMessages.USER_PASSWORD_RESETED,
                        user: response,
                    });
                }
                else {
                    res.status(enums_1.StatusCode.BAD_REQUEST).json({
                        success: false
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const role = req.params.role;
            res.clearCookie(`${role}Token`, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });
            res.status(enums_1.StatusCode.OK).json({
                success: true,
                message: 'Logged out successfully',
            });
        });
    }
    googleAuth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, name, picture, role } = req.body;
                const { isExist, user } = yield this._userService.googleAuth(email, name, picture, role);
                const tokens = (0, generateTokens_1.generateTokens)({
                    id: user === null || user === void 0 ? void 0 : user._id,
                    role: user === null || user === void 0 ? void 0 : user.role,
                });
                res
                    .cookie(`${user === null || user === void 0 ? void 0 : user.role}Token`, tokens.accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 15 * 60 * 1000,
                })
                    .cookie('refreshToken', tokens.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                })
                    .status(enums_1.StatusCode.OK)
                    .json({
                    success: true,
                    message: isExist
                        ? constants_1.UserSuccessMessages.USER_LOGGINED
                        : constants_1.UserSuccessMessages.USER_CREATED,
                    user,
                    token: tokens.accessToken
                });
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = req.cookies.refreshToken;
            if (!token)
                return res.sendStatus(enums_1.StatusCode.UNAUTHORIZED);
            try {
                const payload = jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_SECRET);
                const tokens = (0, generateTokens_1.generateTokens)({
                    id: payload.id,
                    role: payload.role,
                });
                res.cookie(`${payload.role}Token`, tokens.accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 15 * 60 * 1000,
                });
                res.json({ accessToken: tokens.accessToken, role: payload.role });
            }
            catch (_a) {
                res.clearCookie("CandidateToken");
                res.clearCookie("EmployeeToken");
                res.clearCookie("AdminToken");
                return res.sendStatus(enums_1.StatusCode.FORBIDDEN);
            }
        });
    }
    getSavedCandidates(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 10;
                const querys = req.query.querys || "";
                const id = req.query.id || "";
                const role = req.query.role || "";
                const response = yield this._userService.getSavedCandidates({
                    page,
                    pageSize,
                    querys,
                    id,
                    role
                });
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        candidates: response === null || response === void 0 ? void 0 : response.candidates,
                        totalCandidates: response === null || response === void 0 ? void 0 : response.totalCandidates,
                        totalPages: (response === null || response === void 0 ? void 0 : response.totalCandidates) && Math.ceil((response === null || response === void 0 ? void 0 : response.totalCandidates) / pageSize),
                    });
                }
                else {
                    res.status(enums_1.StatusCode.OK).json({
                        success: false,
                        message: "Failed to get saved candidates"
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
                console.log('Error:', err.message);
            }
        });
    }
    saveCandidate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const response = yield this._userService.saveCandidate(payload);
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        message: "Candidate Saved"
                    });
                }
                else {
                    res.status(enums_1.StatusCode.OK).json({
                        success: false,
                        message: "Failed to save candidate"
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
                console.log('Error:', err.message);
            }
        });
    }
    removeSavedCandidate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const response = yield this._userService.removeSavedCandidate(id);
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        message: "Candidate Removed"
                    });
                }
                else {
                    res.status(enums_1.StatusCode.OK).json({
                        success: false,
                        message: "Failed to remove candidate"
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
                console.log('Error:', err.message);
            }
        });
    }
}
exports.UserController = UserController;
