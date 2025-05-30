import mongoose, { Schema, Document } from 'mongoose';
import { IAiVoiceInterviewModel } from '../interfaces/IAiVoiceInterviewModel';

const InterviewResponseSchema = new Schema(
    {
        question: { type: String, required: true },
        type: { type: String, required: true },
    },
    { _id: true }
);

const aiVoiceInterviewSchema = new Schema<IAiVoiceInterviewModel>(
    {
        employeeId: { type: String, required: true },
        questions: { type: [InterviewResponseSchema], required: true }, // using Mixed for flexibility
        jobPosition: { type: String, required: true },
        interviewDuration: { type: String, required: true },
        interviewTypes: { type: [String], required: true }, // Corrected from []String to [String]
        jobDescription: { type: String, required: true },
        jobTitle: { type: String, required: true },
        interviewFor: { type: String, required: true },
        feedBackId: { type: String, required: false },
        isDeleted: { type: Boolean, default: false },
        expiredDate: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    },
    { timestamps: true }
);

export default mongoose.model<IAiVoiceInterviewModel>('AiVoiceInterview', aiVoiceInterviewSchema);
