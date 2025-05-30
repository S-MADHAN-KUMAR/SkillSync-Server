import { Types, Document } from "mongoose";

export interface IFollow extends Document {
    userId: Types.ObjectId;
    followingId: Types.ObjectId;
    status: "pending" | "accepted" | "rejected";
    userType: "candidate" | "company";
    createdAt: Date;
}
