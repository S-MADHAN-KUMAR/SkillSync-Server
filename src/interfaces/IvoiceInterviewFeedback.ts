import { Types, Document } from "mongoose";

export interface IvoiceInterviewFeedback extends Document {
    _id: Types.ObjectId; // Required to match Document interface
    interviewId: Types.ObjectId;
    technicalSkills: number,
    communication: number,
    problemSolving: number,
    experience: number,
    summary: string,
    recommendation: string,
    recommendationMsg: string,
    createdAt?: Date; // Optional since it's auto-assigned by default
}
