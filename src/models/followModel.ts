import { Schema, model } from "mongoose";
import { IFollow } from "../interfaces/IFollow";

const followSchema = new Schema<IFollow>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        followingId: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: "userType", // FIXED from 'type' to 'userType'
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
        },
        userType: {
            type: String,
            enum: ["candidate", "company"],
            required: true,
        },
    },
    { timestamps: true }
);

followSchema.index({ userId: 1, followingId: 1 }, { unique: true });

export const FollowModel = model<IFollow>("Follow", followSchema);
