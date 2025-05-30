import { model, Schema } from "mongoose";
import { IComment } from "../../interfaces/post/IComment";

const commentSchema = new Schema<IComment>(
    {
        userId: { type: Schema.Types.ObjectId, required: true },
        postId: { type: Schema.Types.ObjectId, required: true },
        content: { type: String, required: true },
    },
    { timestamps: true }
);

commentSchema.index({ postId: 1 });

export const CommentModel = model<IComment>("comment", commentSchema);
