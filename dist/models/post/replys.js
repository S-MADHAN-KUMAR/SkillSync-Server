"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplyModel = void 0;
const mongoose_1 = require("mongoose");
const replySchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "user", required: true },
    commentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "comment", required: false },
    parentReplyId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Reply", required: false },
    for: { type: String, required: true },
    content: { type: String, required: true },
}, { timestamps: true });
replySchema.index({ commentId: 1 });
exports.ReplyModel = (0, mongoose_1.model)("reply", replySchema);
