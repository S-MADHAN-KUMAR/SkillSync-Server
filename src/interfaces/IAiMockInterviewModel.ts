import { Document } from "mongoose";

interface IMockQA {
    question: string;
    answer: string;
}

export interface IMockANS {
    questionId: string
    userAnswer: string
    rating: number;
    feedback: string;
}

export interface IAiMockInterview extends Document {
    candidateId: string;
    jsonMockResp: IMockQA[];
    jsonMockAnswer: IMockANS[];
    jobPosition: string;
    jobDescription: string;
    jobExperience: number;
    mode: string;
    isDeleted: boolean
    numberOfQuestions: number;
}
