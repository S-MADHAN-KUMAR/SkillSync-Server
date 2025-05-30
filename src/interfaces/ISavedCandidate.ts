import { Schema, model, Types, Document } from "mongoose";

export interface ISavedCandidate extends Document {
    userId: Types.ObjectId;
    userRole: string;
    isDeleted: boolean;
    candidateId: Types.ObjectId;
    createdAt: Date;
}