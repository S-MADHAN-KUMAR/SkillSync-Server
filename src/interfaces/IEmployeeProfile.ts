import { Document, Types } from 'mongoose';

export interface IEmployeeProfile extends Document {
    userId: Types.ObjectId | string
    logo?: string;
    banner?: string;
    companyName: string;
    aboutCompany: string;
    name?: string;
    profile?: string
    teamSize: number;
    companyType: 'Private' | 'Public' | 'Startup' | 'Non-Profit';
    industryTypes: string;
    founderName: string;
    foundedYear: Date;
    companyVision: string;
    socialLinks: object[];
    companyPhone: number;
    companyEmail: string;
    companyCountry: string;
    companyState: string;
    companyAddress: string;
    jobPosts: string[];
}
