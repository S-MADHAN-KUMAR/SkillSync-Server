import mongoose, { Schema } from "mongoose";
import { IMessage } from "../interfaces/IMessage";

const messageSchema = new Schema<IMessage>({
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: false }, // optional for file messages
    seen: { type: Boolean, default: false },
    attachments: { type: [String], default: [] }, // file URLs or paths
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IMessage>('Message', messageSchema);




