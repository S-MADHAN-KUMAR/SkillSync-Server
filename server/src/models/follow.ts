import { Schema, model, Types, Document } from "mongoose";

interface IFollow extends Document {
    userId: Types.ObjectId; // User who is following
    followingId: Types.ObjectId; // The user or company being followed
    type: "user" | "company"; // Follow type: user or company
    createdAt: Date;
}

const followSchema = new Schema<IFollow>(
    {
        userId: { type: Types.ObjectId, ref: "User", required: true },
        followingId: { type: Types.ObjectId, required: true },
        type: { type: String, enum: ["user", "company"], required: true },
    },
    { timestamps: true }
);

followSchema.index({ userId: 1, followingId: 1 }, { unique: true }); // Prevent duplicate follows

export const FollowModel = model<IFollow>("Follow", followSchema);
