import { Types, Document } from "mongoose";

export interface IMessage extends Document {
    senderId: Types.ObjectId;
    recipientId: Types.ObjectId;
    content?: string;
    attachments?: string[]; // e.g., file URLs or paths
    seen: boolean;
    isDeleted: boolean;
    createdAt: Date;
}
