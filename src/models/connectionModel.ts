import { Schema, model } from "mongoose";
import { IConnection } from "../interfaces/IConnection";

const connectionSchema = new Schema<IConnection>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
        connectedUserId: { type: Schema.Types.ObjectId, ref: "user", required: true },
        status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    },
    { timestamps: true }
);

connectionSchema.index({ userId: 1, connectedUserId: 1 }, { unique: true });

export const ConnectionModel = model<IConnection>("Connection", connectionSchema);
