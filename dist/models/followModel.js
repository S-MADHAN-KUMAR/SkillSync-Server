"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowModel = void 0;
const mongoose_1 = require("mongoose");
const followSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    followingId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        refPath: "userType", // FIXED from 'type' to 'userType'
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
    },
    userType: {
        type: String,
        enum: ["candidate", "company"],
        required: true,
    },
}, { timestamps: true });
followSchema.index({ userId: 1, followingId: 1 }, { unique: true });
exports.FollowModel = (0, mongoose_1.model)("Follow", followSchema);
