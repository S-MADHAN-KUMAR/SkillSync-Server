import mongoose from 'mongoose';
import { ICandidateProfile } from '../interfaces/ICandidateProfile';

const candidateProfileSchema = new mongoose.Schema<ICandidateProfile>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    logo: { type: String },
    banner: { type: String },
    name: { type: String },
    about: { type: String },
    bio: { type: String },
    email: { type: String },
    mobile: {
        type: Number,
        default: null,
        unique: true,
        sparse: true
    },
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
