"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.savedCandidateModel = void 0;
const mongoose_1 = require("mongoose");
const savedCandidateSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "user", required: true },
    userRole: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    candidateId: { type: mongoose_1.Schema.Types.ObjectId, ref: "post", required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });
savedCandidateSchema.index({ userId: 1, candidateId: 1 }, { unique: true });
exports.savedCandidateModel = (0, mongoose_1.model)("SavedCandidate", savedCandidateSchema);
