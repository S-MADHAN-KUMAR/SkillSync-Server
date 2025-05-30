import { Schema, model, Types } from "mongoose";
import { ISavedPost } from "../../interfaces/post/ISavedPost";

const savedPostSchema = new Schema<ISavedPost>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
        userRole: { type: String, required: true },
        postId: { type: Schema.Types.ObjectId, ref: "post", required: true },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

savedPostSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const SavedPostModel = model<ISavedPost>("SavedPost", savedPostSchema);
