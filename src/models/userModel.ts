import mongoose from 'mongoose';
import { IUser } from '../interfaces/IUser';

const userSchema = new mongoose.Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
        type: String,
        enum: ["candidate", "employee"],
    },
    gender: { type: String, enum: ["male", "female", "other"] },
    mobile: {
        type: Number,
        default: null,
        unique: true,
        sparse: true
    },
    profile: {
        type: String, default: null
    },
    hasAiAccess: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    password: { type: String, default: null },
    otp: { type: Number, default: null },
    employeeProfileId: { type: String, default: null },
    candidateProfileId: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    forgotOtp: { type: Number, default: null },
    forgotOtpExpiry: { type: Date, default: null },
    status: { type: Boolean, default: true },
});

export default mongoose.model<IUser>('user', userSchema);
