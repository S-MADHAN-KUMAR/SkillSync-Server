import { Schema, model } from "mongoose";
import { IReply } from "../../interfaces/post/IReply";

const replySchema = new Schema<IReply>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
        commentId: { type: Schema.Types.ObjectId, ref: "comment", required: false },
        parentReplyId: { type: Schema.Types.ObjectId, ref: "Reply", required: false },
        for: { type: String, required: true },
        content: { type: String, required: true },
    },
    { timestamps: true }
);

replySchema.index({ commentId: 1 });

export const ReplyModel = model<IReply>("reply", replySchema);
