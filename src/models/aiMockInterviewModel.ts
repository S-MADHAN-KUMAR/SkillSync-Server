import mongoose, { Schema } from 'mongoose';
import { IAiMockInterview } from '../interfaces/IAiMockInterviewModel';

const mockResponseSchema = new Schema(
    {
        question: { type: String, required: true },
        answer: { type: String, required: true },
    },
    { _id: true }
);

const mockAnswerSchema = new Schema(
    {
        questionId: { type: String, required: true },
        userAnswer: { type: String, required: true },
        rating: { type: Number, required: true },
        feedback: { type: String, required: true },
    },
    { _id: true }
);

const aiMockInterviewSchema = new Schema<IAiMockInterview>(
    {
        candidateId: { type: String, required: true },
        jsonMockResp: { type: [mockResponseSchema], required: true },
        jsonMockAnswer: { type: [mockAnswerSchema], required: false },
        jobPosition: { type: String, required: true },
        jobDescription: { type: String, required: true },
        jobExperience: { type: Number, required: true },
        mode: { type: String, required: true },
        numberOfQuestions: { type: Number, required: true },
        isDeleted: { type: Boolean, default: false }
    },
    { timestamps: true }
);

export default mongoose.model<IAiMockInterview>('aiMockInterview', aiMockInterviewSchema);
