import { Schema, model, Types, Document } from "mongoose";

interface IPost extends Document {
    userId: Types.ObjectId;
    role: "candidate" | "employee" | "admin";
    posterName: string;
    posterAvatar?: string;
    description: string;
    media?: {
        imageUrls?: string[];
        videoUrl?: string;
        pdfUrl?: string;
    };
    tags?: string[];
    likesCount: number;
    commentsCount: number;
    isEdited: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new Schema<IPost>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["candidate", "employee", "admin"], required: true },
        posterName: { type: String, required: true },
        posterAvatar: String,
        description: { type: String, required: true },
        media: {
            imageUrls: [String],
            videoUrl: String,
            pdfUrl: String,
        },
        tags: [String],
        likesCount: { type: Number, default: 0 },
        commentsCount: { type: Number, default: 0 },
        isEdited: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const PostModel = model<IPost>("Post", postSchema);
