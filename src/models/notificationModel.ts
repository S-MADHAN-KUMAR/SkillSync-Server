import mongoose, { Schema } from "mongoose";
import { INotification, NotificationType } from "../interfaces/INotification";

const notificationSchema = new Schema<INotification>({
    recipientId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    content: { type: String, required: true },
    link: { type: String, required: false },
    type: {
        type: String,
        required: true,
        enum: ["connection", "like", "comment", "reply", "message", "connection_rejected", 'disconnected', "follow", "follow-rejected", "unfollow", "interview"], // same as NotificationType
    },
    read: { type: Boolean, default: false },
    attachments: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<INotification>("notification", notificationSchema);
