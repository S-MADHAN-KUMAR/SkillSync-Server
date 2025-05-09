import { Schema, model, Types, Document } from "mongoose";

interface ISavedPost extends Document {
    userId: Types.ObjectId;
    postId: Types.ObjectId;
    createdAt: Date;
}

const savedPostSchema = new Schema<ISavedPost>(
    {
        userId: { type: Types.ObjectId, ref: "User", required: true },
        postId: { type: Types.ObjectId, ref: "Post", required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

savedPostSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const SavedPostModel = model<ISavedPost>("SavedPost", savedPostSchema);
