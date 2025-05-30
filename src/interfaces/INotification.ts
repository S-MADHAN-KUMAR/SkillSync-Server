import { Types, Document } from "mongoose";

// Define allowed notification types
export type NotificationType = "connection" | "like" | "comment" | "reply" | "message" | "connection_rejected" | 'disconnected' | "follow" | "follow-rejected" | "unfollow" | "interview"

export interface INotification extends Document {
    recipientId: Types.ObjectId;
    senderId: Types.ObjectId;
    content: string;
    link?: string;
    type: NotificationType;
    attachments?: string[];
    read: boolean;
    createdAt: Date;
}
