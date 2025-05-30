"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedPostModel = void 0;
const mongoose_1 = require("mongoose");
const savedPostSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "user", required: true },
    userRole: { type: String, required: true },
    postId: { type: mongoose_1.Schema.Types.ObjectId, ref: "post", required: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: { createdAt: true, updatedAt: false } });
savedPostSchema.index({ userId: 1, postId: 1 }, { unique: true });
exports.SavedPostModel = (0, mongoose_1.model)("SavedPost", savedPostSchema);
