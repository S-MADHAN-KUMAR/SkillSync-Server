import { Types, Document } from "mongoose";

export interface IConnection extends Document {
    userId: Types.ObjectId;
    connectedUserId: Types.ObjectId;
    status: "pending" | "accepted" | "rejected";
    createdAt: Date;
    updatedAt: Date;
}
