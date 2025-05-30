import mongoose from 'mongoose';
import { IJobPost } from '../interfaces/IJobPost';

const jobPostSchema = new mongoose.Schema<IJobPost>({
    jobTitle: { type: String, required: true },
    logo: { type: String, required: true },
    tags: [{ type: String }],
    minSalary: { type: Number, required: true },
    maxSalary: { type: Number, required: true },
    salaryType: { type: String, required: true },
    education: { type: String, required: true },
    experience: { type: String, required: true },
    jobType: { type: String, required: true },
    expiredAt: { type: Date, required: true },
    jobLevel: { type: String, required: true },
    vacancies: { type: Number, required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    address: { type: String, required: true },
    jobDescription: { type: String, required: true },
    jobBenefits: [{ type: String }],
    status: { type: Boolean, default: true },
    postedAt: { type: Date, default: Date.now },
    employeeId: { type: String },
    companyName: { type: String },
    applications: { type: Number, default: 0 }
});

export default mongoose.model<IJobPost>('jobPost', jobPostSchema);