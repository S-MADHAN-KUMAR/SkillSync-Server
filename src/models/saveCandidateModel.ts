import { Schema, model, Types } from "mongoose";
import { ISavedCandidate } from "../interfaces/ISavedCandidate";

const savedCandidateSchema = new Schema<ISavedCandidate>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
        userRole: { type: String, required: true },
        isDeleted: { type: Boolean, default: false },
        candidateId: { type: Schema.Types.ObjectId, ref: "post", required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

savedCandidateSchema.index({ userId: 1, candidateId: 1 }, { unique: true });

export const savedCandidateModel = model<ISavedCandidate>("SavedCandidate", savedCandidateSchema);
