"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModel = void 0;
const mongoose_1 = require("mongoose");
const commentSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    postId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    content: { type: String, required: true },
}, { timestamps: true });
commentSchema.index({ postId: 1 });
exports.CommentModel = (0, mongoose_1.model)("comment", commentSchema);
