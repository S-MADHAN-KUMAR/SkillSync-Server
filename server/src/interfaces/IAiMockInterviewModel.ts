import { Document } from "mongoose";

interface IMockQA {
    question: string;
    answer: string;
}

export interface IAiMockInterview extends Document {
    candidateId: string;
    jsonMockResp: IMockQA[];
    jobPosition: string;
    jobDescription: string;
    jobExperience: number;
    mode: string;
    numberOfQuestions: number;
}
