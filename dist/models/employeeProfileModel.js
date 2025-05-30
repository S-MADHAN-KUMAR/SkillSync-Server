"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const employeeProfileSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId },
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
exports.default = mongoose_1.default.model('employeeProfile', employeeProfileSchema);
