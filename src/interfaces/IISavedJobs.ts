import { Schema, model, Types, Document } from "mongoose";

export interface ISavedJobs extends Document {
    userId: Types.ObjectId;
    _id: Types.ObjectId | string;
    jobId: Types.ObjectId;
    isDeleted: boolean
    createdAt: Date;
}