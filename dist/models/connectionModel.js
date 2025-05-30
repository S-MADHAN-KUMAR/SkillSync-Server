"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionModel = void 0;
const mongoose_1 = require("mongoose");
const connectionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "user", required: true },
    connectedUserId: { type: mongoose_1.Schema.Types.ObjectId, ref: "user", required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
}, { timestamps: true });
connectionSchema.index({ userId: 1, connectedUserId: 1 }, { unique: true });
exports.ConnectionModel = (0, mongoose_1.model)("Connection", connectionSchema);
