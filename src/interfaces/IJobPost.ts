import { Document } from 'mongoose';

export interface IJobPost extends Document {
    jobTitle: string;
    logo: string;
    tags: string[];
    minSalary: number;
    maxSalary: number;
    salaryType: string;
    education: string;
    experience: string;
    jobType: string;
    expiredAt: Date;
    jobLevel: string;
    vacancies: number;
    country: string;
    state: string;
    address: string;
    jobDescription: string;
    jobBenefits: string[];
    status: boolean;
    postedAt: Date
    companyLogo: string
    applications: number
    employeeId: string
    companyName: string
}
