import mongoose, { Schema } from "mongoose";
import { IvoiceInterviewFeedback } from "../interfaces/IvoiceInterviewFeedback";

const voiceInterviewFeedbackSchema = new Schema<IvoiceInterviewFeedback>({
    interviewId: { type: Schema.Types.ObjectId, required: true },
    technicalSkills: { type: Number, required: true },
    communication: { type: Number, required: true },
    problemSolving: { type: Number, required: true },
    experience: { type: Number, required: true },
    summary: { type: String, required: true },
    recommendation: { type: String, required: true },
    recommendationMsg: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IvoiceInterviewFeedback>('voiceInterviewFeedback', voiceInterviewFeedbackSchema);