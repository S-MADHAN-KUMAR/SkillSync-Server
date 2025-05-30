import { Types, Document } from "mongoose";

export interface IInterviewConversation extends Document {
    _id: Types.ObjectId; // Required to match Document interface
    interviewId: Types.ObjectId;
    question: string;
    aiResponse: string;
    userAnswer: string;
    createdAt?: Date; // Optional since it's auto-assigned by default
}
