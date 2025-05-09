import { Schema, model, Types, Document } from "mongoose";

interface ILike extends Document {
    userId: Types.ObjectId;
    postId: Types.ObjectId;
    createdAt: Date;
}

const likeSchema = new Schema<ILike>(
    {
        userId: { type: Types.ObjectId, ref: "User", required: true },
        postId: { type: Types.ObjectId, ref: "Post", required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

likeSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const LikeModel = model<ILike>("Like", likeSchema);
