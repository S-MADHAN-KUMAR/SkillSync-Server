"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const candidateProfileSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'user' },
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
exports.default = mongoose_1.default.model('candidateProfile', candidateProfileSchema);
