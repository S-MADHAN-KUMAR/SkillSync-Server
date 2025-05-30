import { Document, Types } from 'mongoose';

export interface ICandidateProfile extends Document {
    userId: Types.ObjectId | string;
    logo: string;
    banner: string;
    name: string;
    about: string;
    bio: string;
    email: string,
    mobile?: number | null,
    country: string,
    state: string,
    address: string,
    gender: string,
    website: string,
    skills: string[],
    education: { type: [Object] },
    experience: { type: [Object] },
    resume: string,
}
