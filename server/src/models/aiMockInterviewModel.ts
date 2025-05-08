import mongoose, { Schema } from 'mongoose';
import { IAiMockInterview } from '../interfaces/IAiMockInterviewModel';

const mockResponseSchema = new Schema(
    {
        question: { type: String, required: true },
        answer: { type: String, required: true },
    },
    { _id: false }
);

const aiMockInterviewSchema = new Schema<IAiMockInterview>(
    {
        candidateId: { type: String, required: true },
        jsonMockResp: { type: [mockResponseSchema], required: true },
        jobPosition: { type: String, required: true },
        jobDescription: { type: String, required: true },
        jobExperience: { type: Number, required: true },
        mode: { type: String, required: true },
        numberOfQuestions: { type: Number, required: true },
    },
    { timestamps: true }
);

export default mongoose.model<IAiMockInterview>('aiMockInterview', aiMockInterviewSchema);
