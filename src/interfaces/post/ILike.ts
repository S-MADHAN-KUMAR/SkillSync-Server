import { Types, Document } from "mongoose";

export interface ILike extends Document {
    userId: Types.ObjectId;
    postId: Types.ObjectId;
    createdAt: Date;
}