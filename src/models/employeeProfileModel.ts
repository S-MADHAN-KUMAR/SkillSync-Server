import mongoose from 'mongoose';
import { IEmployeeProfile } from '../interfaces/IEmployeeProfile';

const employeeProfileSchema = new mongoose.Schema<IEmployeeProfile>({
    userId: { type: mongoose.Schema.Types.ObjectId },
    logo: { type: String },
    banner: { type: String },
    companyName: { type: String },
    aboutCompany: { type: String },
    teamSize: { type: Number },
    companyType: { type: String, enum: ['Private', 'Public', 'Startup', 'Non-Profit'] },
    industryTypes: { type: String },
    founderName: { type: String },
    foundedYear: { type: Date },
    companyVision: { type: String },
    socialLinks: { type: [Object] },
    companyPhone: { type: Number },
    companyEmail: { type: String },
    companyCountry: { type: String },
    companyState: { type: String },
    companyAddress: { type: String },
    jobPosts: { type: [String] }
});

export default mongoose.model<IEmployeeProfile>('employeeProfile', employeeProfileSchema);
