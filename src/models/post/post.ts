import mongoose, { Schema, model } from "mongoose";
import { IPost } from "../../interfaces/post/IPost";

const postSchema = new Schema<IPost>(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        role: { type: String, enum: ["candidate", "employee", "admin"], required: true },
        posterName: { type: String, required: true },
        posterAvatar: String,
        description: { type: String, required: true },
        imageUrls: [String],
        tags: [String],
        likesCount: { type: Number, default: 0 },
        commentsCount: { type: Number, default: 0 },
        status: { type: Boolean, default: true },
        isEdited: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const PostModel = model<IPost>("posts", postSchema);
