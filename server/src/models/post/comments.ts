import { Schema, model, Types, Document } from "mongoose";

interface IComment extends Document {
    userId: Types.ObjectId;
    postId: Types.ObjectId;
    text: string;
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
    {
        userId: { type: Types.ObjectId, ref: "User", required: true },
        postId: { type: Types.ObjectId, ref: "Post", required: true },
        text: { type: String, required: true },
    },
    { timestamps: true }
);

commentSchema.index({ postId: 1 });

export const CommentModel = model<IComment>("Comment", commentSchema);
