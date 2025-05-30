import { Types, Document } from "mongoose";

export interface IReply extends Document {
    userId: Types.ObjectId;
    commentId?: Types.ObjectId;
    parentReplyId?: Types.ObjectId;
    content: string;
    for: string;
    createdAt: Date;
    updatedAt: Date;
}
