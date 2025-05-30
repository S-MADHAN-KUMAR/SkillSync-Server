import mongoose, { Schema } from 'mongoose';
import { IApplicationModel } from '../interfaces/IApplicationModel';

const applicationSchema = new Schema<IApplicationModel>(
    {
        jobId: {
            type: Schema.Types.ObjectId,
            ref: 'JobPost',
            required: true,
        },
        candidateId: {
            type: Schema.Types.ObjectId,
            ref: 'User', // Capitalized if your model is 'User'
            required: true,
        },
        status: {
            type: String,
            enum: ['applied', 'reviewed', 'interview', 'hired', 'rejected'],
            default: 'applied',
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model<IApplicationModel>('Application', applicationSchema);
