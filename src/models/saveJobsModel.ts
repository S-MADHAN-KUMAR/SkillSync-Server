import { Schema, model, Types } from "mongoose";
import { ISavedJobs } from "../interfaces/IISavedJobs";


const savedJobsSchema = new Schema<ISavedJobs>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
        jobId: { type: Schema.Types.ObjectId, required: true },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

savedJobsSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export const savedJobsModel = model<ISavedJobs>("SavedJobs", savedJobsSchema);
