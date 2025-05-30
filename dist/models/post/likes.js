"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeModel = void 0;
const mongoose_1 = require("mongoose");
const likeSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "user", required: true },
    postId: { type: mongoose_1.Schema.Types.ObjectId, ref: "post", required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });
likeSchema.index({ userId: 1, postId: 1 }, { unique: true });
exports.LikeModel = (0, mongoose_1.model)("Like", likeSchema);
