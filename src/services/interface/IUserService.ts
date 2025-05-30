import { ICandidateProfile } from "../../interfaces/ICandidateProfile";
import { ISavedCandidate } from "../../interfaces/ISavedCandidate";
import { IUser } from "../../interfaces/IUser";
import { login, otp, resetPassword, status } from "../../types/types";

export interface IUserService {
    register(payload: IUser): Promise<IUser | null>;
    login(payload: login): Promise<IUser | null>;
    getUserWithEmail(id: string): Promise<IUser | null>
    googleAuth(email: string, name: string, picture: string, role: string): Promise<{ isExist: boolean, user: IUser | null }>
    otpVerify(payload: otp): Promise<IUser | null>
    forgotEmail(email: string): Promise<IUser | null>
    resetOtp(email: string): Promise<IUser | null>
    forgotOtpVerify(payload: otp): Promise<IUser | null>
    resetPassword(payload: resetPassword): Promise<IUser | null>
    getAllEmployees(page: number, pageSize: number, querys: string): Promise<{ employees: IUser[] | null, totalEmployees: number }>
    getAllCandidates(page: number, pageSize: number, querys: string): Promise<{ candidates: IUser[] | null, totalCandidates: number }>
    toggleStatus(payload: status): Promise<boolean>
    togglePostStatus(payload: status): Promise<boolean>
    saveCandidate(payload: {
        userId: string,
        userRole: string,
        candidateId: string
    }): Promise<boolean | null>
    removeSavedCandidate(id: string): Promise<boolean | null>
    getSavedCandidates(payload: { page: number, pageSize: number, querys: string, id: string, role: string }): Promise<{ candidates: ICandidateProfile[]; totalCandidates: number | null }>
}