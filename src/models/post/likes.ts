import { Schema, model } from "mongoose";
import { ILike } from "../../interfaces/post/ILike";

const likeSchema = new Schema<ILike>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
        postId: { type: Schema.Types.ObjectId, ref: "post", required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

likeSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const LikeModel = model<ILike>("Like", likeSchema);
