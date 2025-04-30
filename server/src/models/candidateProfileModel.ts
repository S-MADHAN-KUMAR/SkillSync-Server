import mongoose from 'mongoose';
import { ICandidateProfile } from '../interfaces/ICandidateProfile';

const candidateProfileSchema = new mongoose.Schema<ICandidateProfile>({
    userId: { type: String },
    logo: { type: String },
    banner: { type: String },
    name: { type: String },
    about: { type: String },
    bio: { type: String },
    country: { type: String },
    state: { type: String },
    address: { type: String },
    gender: { type: String },
    website: { type: String },
    skills: { type: [String] },
    education: { type: [Object] },
    experience: { type: [Object] },
    resume: { type: String },
});

export default mongoose.model<ICandidateProfile>('candidateProfile', candidateProfileSchema);
