import { Schema, model, Types, Document } from "mongoose";

interface IReply extends Document {
    userId: Types.ObjectId;
    commentId: Types.ObjectId;
    text: string;
    createdAt: Date;
    updatedAt: Date;
}

const replySchema = new Schema<IReply>(
    {
        userId: { type: Types.ObjectId, ref: "User", required: true },
        commentId: { type: Types.ObjectId, ref: "Comment", required: true },
        text: { type: String, required: true },
    },
    { timestamps: true }
);

replySchema.index({ commentId: 1 });

export const ReplyModel = model<IReply>("Reply", replySchema);
