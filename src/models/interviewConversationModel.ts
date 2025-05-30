import mongoose, { Schema } from "mongoose";
import { IInterviewConversation } from "../interfaces/IInterviewConversation";

const interviewConversationSchema = new Schema<IInterviewConversation>({
    interviewId: { type: Schema.Types.ObjectId, required: true },
    question: { type: String, required: true },
    userAnswer: { type: String, required: true },
    aiResponse: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IInterviewConversation>('interviewConversation', interviewConversationSchema);