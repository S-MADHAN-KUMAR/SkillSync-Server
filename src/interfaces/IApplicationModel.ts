import { Document, Types } from 'mongoose';

export interface IApplicationModel extends Document {
    jobId: Types.ObjectId;
    candidateId: Types.ObjectId;
    status?: 'applied' | 'reviewed' | 'interview' | 'hired' | 'rejected';
    appliedAt?: Date;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
