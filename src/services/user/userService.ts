import { Types } from "mongoose";
import { IUser } from "../../interfaces/IUser";
import { IUserRepository } from "../../repositories/interface/IUserRepository";
import { login, otp, resetPassword, status } from "../../types/types";
import { OTPErrorMessages, PostErrorMessages, UserErrorMessages, UserSuccessMessages } from "../../utils/constants";
import { Roles, StatusCode } from "../../utils/enums";
import { hashPassword } from "../../utils/hashPassword";
import { HttpError } from "../../utils/httpError";
import { sendEmail } from "../../utils/sendmail";
import { IUserService } from "../interface/IUserService";
import bcrypt from 'bcrypt'
import { ISavedCandidate } from "../../interfaces/ISavedCandidate";
import { ISaveCandidateRepository } from "../../repositories/interface/ISaveCandidateRepository";
import { ICandidateProfile } from "../../interfaces/ICandidateProfile";
import { ICandidateRepository } from "../../repositories/interface/ICandidateRepository";

export class UserService implements IUserService {
    private _userRepository: IUserRepository
    private _savedCandidatesRepository: ISaveCandidateRepository
    private _candidatesRepository: ICandidateRepository

    constructor(_userRepository: IUserRepository, _savedCandidatesRepository: ISaveCandidateRepository, _candidatesRepository: ICandidateRepository) {
        this._userRepository = _userRepository;
        this._savedCandidatesRepository = _savedCandidatesRepository;
        this._candidatesRepository = _candidatesRepository;
    }

    async register(payload: IUser): Promise<IUser | null> {
        try {

            const userFound = await this._userRepository.findOne({ $or: [{ email: payload?.email }, { mobile: payload?.mobile }] });
            if (userFound) {
                throw new HttpError(UserErrorMessages.USER_FAILED_TO_CREATED, StatusCode.BAD_REQUEST);
            }

            const hashedPassword = await hashPassword(payload.password);
            const otp = Math.floor(100000 + Math.random() * 900000)
            const otpExpiry = new Date(Date.now() + 60 * 1000);

            const response = await this._userRepository.create({
                ...payload,
                password: hashedPassword,
                otp,
                otpExpiry
            });

            await sendEmail({
                to: response.email,
                subject: 'SKILL-SYNC - OTP Verification',
                otp: String(otp),
            });

            setTimeout(async () => {
                try {
                    const id = response._id as string
                    const foundUser = await this._userRepository.findById(id);

                    if (foundUser && !foundUser.isVerified && foundUser.otpExpiry && foundUser.otpExpiry.getTime() < Date.now()) {
                        const updatedId = foundUser._id as string
                        await this._userRepository.delete(updatedId);
                        console.log(`User with email ${foundUser.email} deleted due to expired OTP.`);
                    }
                } catch (cleanupError) {
                    console.error('Error during OTP expiry cleanup:', cleanupError);
                }
            }, 60000);

            return response;

        } catch (error) {
            console.error('Error creating candidate:', error);
            throw error;
        }
    }

    async login(payload: login): Promise<IUser | null> {
        try {
            const userFound = await this._userRepository.findOne({ email: payload?.email });

            if (!userFound) {
                throw new HttpError(UserErrorMessages.INVALID_CREDENTIALS, StatusCode.UNAUTHORIZED);
            }

            if (!userFound.status) {
                throw new HttpError(UserErrorMessages.USER_BLOCKED, StatusCode.UNAUTHORIZED);
            }

            if (!userFound?.password) {
                throw new HttpError(UserErrorMessages.USER_FAILED_TO_LOGGIN, StatusCode.UNAUTHORIZED);
            }

            const isMatch = await bcrypt.compare(payload.password, userFound.password);

            if (!isMatch) {
                throw new HttpError(UserErrorMessages.INVALID_CREDENTIALS, StatusCode.UNAUTHORIZED);
            }

            return userFound;
        } catch (error) {
            throw error;
        }
    }

    async getUserWithEmail(email: string): Promise<IUser | null> {
        const response = await this._userRepository.findOne({ email })
        if (response) {
            return response
        } else {
            return null
        }
    }

    async googleAuth(email: string, name: string, picture: string, role: string): Promise<{ isExist: boolean, user: IUser | null }> {
        if (!email || !name || !picture) {
            throw new HttpError('Something went wrong', StatusCode.BAD_REQUEST);
        }

        const data = { email, name, profile: picture };

        const existing = await this._userRepository.findOne({ email });

        if (existing) {
            if (existing && existing?.status === false) {
                throw new HttpError(UserErrorMessages.USER_BLOCKED, StatusCode.BAD_REQUEST);
            }
            const userId = existing._id as string;
            const user = await this._userRepository.update(userId, { email: data?.email, isVerified: true });
            return { isExist: true, user };
        } else {
            const user = await this._userRepository.create({ ...data, role, isVerified: true });
            return { isExist: false, user };
        }
    }

    async otpVerify(payload: { id: string; otp: string }): Promise<IUser | null> {
        const { id, otp } = payload;

        if (!id || !otp) {
            throw new HttpError('Id and OTP are required', StatusCode.BAD_REQUEST);
        }

        const existing = await this._userRepository.findById(id);

        if (!existing) {
            throw new HttpError(UserErrorMessages.USER_NOT_REGISTER, StatusCode.BAD_REQUEST);
        }

        if (existing.otpExpiry && new Date() > new Date(existing.otpExpiry)) {
            throw new HttpError(UserErrorMessages.OTP_EXPIRED, StatusCode.BAD_REQUEST);
        }

        if (Number(otp) !== Number(existing.otp)) {
            throw new HttpError(OTPErrorMessages.INCORRECT_OTP, StatusCode.BAD_REQUEST);
        }

        await this._userRepository.updateNull(id, {
            otp: null,
            otpExpiry: null,
            isVerified: true,
        });

        return await this._userRepository.findById(id);
    }

    async forgotEmail(email: string): Promise<IUser | null> {
        const userFound = await this._userRepository.findOne({ email });

        if (!userFound) {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.BAD_REQUEST);
        }

        const forgotOtp = Math.floor(100000 + Math.random() * 900000);
        const forgotOtpExpiry = new Date(Date.now() + 5 * 60 * 1000);

        const updatedUser = await this._userRepository.update(userFound._id as string, {
            forgotOtp,
            forgotOtpExpiry,
        });

        if (!updatedUser) {
            throw new HttpError('Failed to update user with forgot OTP.', StatusCode.INTERNAL_SERVER_ERROR);
        }

        await sendEmail({
            to: updatedUser.email,
            subject: 'SKILL-SYNC - FORGOT OTP Verification',
            otp: String(forgotOtp),
        });
        setTimeout(async () => {
            try {
                const foundUser = await this._userRepository.findById(updatedUser._id as string);
                if (foundUser && foundUser.forgotOtpExpiry && foundUser.forgotOtpExpiry.getTime() < Date.now()) {
                    await this._userRepository.updateNull(foundUser._id as string, { forgotOtpExpiry: null, forgotOtp: null });
                    console.log(`User with email ${foundUser.email} forgot OTP cleared after expiry.`);
                }
            } catch (cleanupError) {
                console.error('Error during OTP expiry cleanup:', cleanupError);
            }
        }, 5 * 60 * 1000);

        return updatedUser;
    }

    async resetOtp(email: string): Promise<IUser | null> {
        const userFound = await this._userRepository.findOne({ email });

        if (!userFound) {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.BAD_REQUEST);
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

        const updatedUser = await this._userRepository.update(userFound._id as string, {
            otp,
            otpExpiry,
        });

        if (!updatedUser) {
            throw new HttpError('Failed to update user with  OTP.', StatusCode.INTERNAL_SERVER_ERROR);
        }
        await sendEmail({
            to: updatedUser.email,
            subject: 'SKILL-SYNC - OTP Verification',
            otp: String(otp),
        });
        setTimeout(async () => {
            try {
                const id = updatedUser._id as string
                const foundUser = await this._userRepository.findById(id);

                if (foundUser && !foundUser.isVerified && foundUser.otpExpiry && foundUser.otpExpiry.getTime() < Date.now()) {
                    const updatedId = foundUser._id as string
                    await this._userRepository.delete(updatedId);
                    console.log(`User with email ${foundUser.email} deleted due to expired OTP.`);
                }
            } catch (cleanupError) {
                console.error('Error during OTP expiry cleanup:', cleanupError);
            }
        }, 60000);

        return updatedUser;
    }

    async forgotOtpVerify(payload: { id: string; otp: string }): Promise<IUser | null> {
        const { id, otp } = payload;

        if (!id || !otp) {
            throw new HttpError('Id and OTP are required', StatusCode.BAD_REQUEST);
        }

        const existing = await this._userRepository.findById(id);

        if (!existing) {
            throw new HttpError(UserErrorMessages.USER_NOT_REGISTER, StatusCode.BAD_REQUEST);
        }

        if (existing.forgotOtpExpiry && new Date() > new Date(existing.forgotOtpExpiry)) {
            throw new HttpError(UserErrorMessages.OTP_EXPIRED, StatusCode.BAD_REQUEST);
        }

        if (Number(otp) !== Number(existing.forgotOtp)) {
            throw new HttpError(UserErrorMessages.USER_WRONG_OTP, StatusCode.BAD_REQUEST);
        }

        await this._userRepository.updateNull(id, {
            forgotOtp: null,
            forgotOtpExpiry: null
        });

        return await this._userRepository.findById(id);
    }

    async resetPassword(payload: resetPassword): Promise<IUser | null> {
        const response = await this._userRepository.findById(payload?.id)
        if (response) {
            const hashedPassword = await hashPassword(payload.password);
            const updated = await this._userRepository.update(payload?.id, { password: hashedPassword })
            return updated
        } else {
            return null
        }
    }

    async getAllEmployees(
        page: number,
        pageSize: number,
        querys?: string
    ): Promise<{ employees: IUser[] | null; totalEmployees: number }> {
        const skip = (page - 1) * pageSize;

        const filter: any = { role: Roles.EMPLOYEE };
        if (querys) {
            filter.name = { $regex: querys, $options: 'i' };
        }

        const employees = await this._userRepository.findAll(filter, skip, pageSize);

        const totalEmployees = await this._userRepository.countDocuments(filter);

        if (employees) {
            return { employees, totalEmployees };
        } else {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
        }
    }

    async getAllCandidates(
        page: number,
        pageSize: number,
        querys: string
    ): Promise<{ candidates: IUser[] | null; totalCandidates: number }> {
        const skip = (page - 1) * pageSize;

        const filter: any = { role: Roles.CANDIDATE };
        if (querys) {
            filter.name = { $regex: querys, $options: 'i' };
        }

        const candidates = await this._userRepository.findAll(filter, skip, pageSize);
        const totalCandidates = await this._userRepository.countDocuments(filter);

        if (candidates) {
            return { candidates, totalCandidates };
        } else {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
        }
    }

    async toggleStatus(payload: status): Promise<boolean> {
        if (!payload) {
            throw new HttpError(UserErrorMessages.INVALID_PAYLOAD, StatusCode.BAD_REQUEST);
        }

        let response: any = null;

        if (payload.role === Roles.CANDIDATE) {
            response = await this._userRepository.update(payload.id, { status: payload.status });
        } else if (payload.role === Roles.EMPLOYEE) {
            response = await this._userRepository.update(payload.id, { status: payload.status });
        }

        if (response) {
            return true;
        } else {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
        }
    }

    async togglePostStatus(payload: status): Promise<boolean> {
        if (!payload) {
            throw new HttpError(UserErrorMessages.INVALID_PAYLOAD, StatusCode.BAD_REQUEST);
        }

        let response: any = null;


        response = await this._userRepository.update(payload.id, { hasAiAccess: payload.status });


        if (response) {
            return true;
        } else {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
        }
    }

    async saveCandidate(payload: {
        userId: string;
        userRole: string;
        candidateId: string;
    }): Promise<boolean | null> {
        const userId = new Types.ObjectId(payload.userId);
        const candidateId = new Types.ObjectId(payload.candidateId);

        const existing = await this._savedCandidatesRepository.findOne({
            userId,
            userRole: payload.userRole,
            candidateId,
        });

        if (existing) {
            if (existing.isDeleted) {
                await this._savedCandidatesRepository.update(existing._id as string, { isDeleted: false });
                return true;
            }
            // Already exists and not deleted, don't create duplicate
            return true;
        }

        const response = await this._savedCandidatesRepository.create({
            userId,
            userRole: payload.userRole,
            candidateId,
        });

        if (response) {
            return true;
        } else {
            throw new HttpError(PostErrorMessages.POST_NOT_FOUND, StatusCode.NOT_FOUND);
        }
    }

    async removeSavedCandidate(id: string): Promise<boolean | null> {
        const response = await this._savedCandidatesRepository.update(id, { isDeleted: true })
        if (response) {
            return true
        } else {
            throw new HttpError(PostErrorMessages.POST_NOT_FOUND, StatusCode.NOT_FOUND)
        }
    }

    async getSavedCandidates(payload: {
        page: number;
        pageSize: number;
        querys: string;
        id: string;
        role: string;
    }): Promise<{ candidates: (ICandidateProfile & { savedCandidateId: string })[]; totalCandidates: number | null }> {
        const skip = (payload.page - 1) * payload.pageSize;

        const filter: any = {
            userId: new Types.ObjectId(payload.id),
            userRole: payload.role,
            isDeleted: false,
        };

        const savedCandidates = await this._savedCandidatesRepository.findAll(filter, skip, payload.pageSize);
        const totalCandidates = await this._savedCandidatesRepository.countDocuments(filter);

        if (!savedCandidates || savedCandidates.length === 0) {
            return { candidates: [], totalCandidates: 0 };
        }

        const candidateIds = savedCandidates.map((saved) => saved.candidateId);
        let candidateProfiles = await this._candidatesRepository.findAll({ _id: { $in: candidateIds } });

        if (payload.querys) {
            const queryRegex = new RegExp(payload.querys, 'i');
            candidateProfiles = candidateProfiles.filter((candidate: any) =>
                queryRegex.test(candidate.name)
            );
        }

        // Create a map for fast lookup
        const savedCandidateMap = new Map(
            savedCandidates.map((saved: any) => [saved.candidateId.toString(), saved._id.toString()])
        );

        // Attach savedCandidateId to each candidate
        const candidatesWithSavedId = candidateProfiles.map((candidate: any) => ({
            ...candidate.toObject?.() ?? candidate,
            savedCandidateId: savedCandidateMap.get(candidate._id.toString()) || '',
        }));

        return {
            candidates: candidatesWithSavedId,
            totalCandidates,
        };
    }

}