import { Document } from "mongoose";


export interface IUser extends Document {
    name: string,
    email: string,
    role: string,
    gender: string,
    mobile?: number | null,
    profile: string,
    isVerified: boolean,
    password: string,
    status?: boolean,
    hasAiAccess?: boolean,
    otp: number | null,
    otpExpiry: Date | null,
    forgotOtp: number | null,
    forgotOtpExpiry: Date | null,
    employeeProfileId: String | unknown,
    candidateProfileId: String | unknown,
}