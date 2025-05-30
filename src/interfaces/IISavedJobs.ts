import { Schema, model, Types, Document } from "mongoose";

export interface ISavedJobs extends Document {
    userId: Types.ObjectId;
    jobId: Types.ObjectId;
    isDeleted: boolean
    createdAt: Date;
}