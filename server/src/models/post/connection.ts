import { Schema, model, Types, Document } from "mongoose";

interface IConnection extends Document {
    userId: Types.ObjectId; // The user initiating the connection
    connectedUserId: Types.ObjectId; // The user being connected to
    status: "pending" | "accepted" | "rejected"; // Connection status
    createdAt: Date;
    updatedAt: Date;
}

const connectionSchema = new Schema<IConnection>(
    {
        userId: { type: Types.ObjectId, ref: "User", required: true },
        connectedUserId: { type: Types.ObjectId, ref: "User", required: true },
        status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    },
    { timestamps: true }
);

connectionSchema.index({ userId: 1, connectedUserId: 1 }, { unique: true });

export const ConnectionModel = model<IConnection>("Connection", connectionSchema);
