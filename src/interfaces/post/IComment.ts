import { Schema, model, Types, Document } from "mongoose";

export interface IComment extends Document {
    userId: Types.ObjectId;
    postId: Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}
