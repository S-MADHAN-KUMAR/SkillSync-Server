import { Document } from 'mongoose';

export interface ICandidateProfile extends Document {
    userId: string,
    logo: string;
    banner: string;
    name: string;
    about: string;
    bio: string;
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
