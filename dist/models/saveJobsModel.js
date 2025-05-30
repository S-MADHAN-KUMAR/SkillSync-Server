"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.savedJobsModel = void 0;
const mongoose_1 = require("mongoose");
const savedJobsSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "user", required: true },
    jobId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: { createdAt: true, updatedAt: false } });
savedJobsSchema.index({ userId: 1, jobId: 1 }, { unique: true });
exports.savedJobsModel = (0, mongoose_1.model)("SavedJobs", savedJobsSchema);
