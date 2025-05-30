import { Schema, model, Types, Document } from "mongoose";

export interface ISavedPost extends Document {
    userId: Types.ObjectId;
    userRole: string;
    postId: Types.ObjectId;
    createdAt: Date;
    isDeleted: boolean
}