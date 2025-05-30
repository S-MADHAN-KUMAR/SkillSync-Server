import mongoose, { Schema, Document } from 'mongoose';

interface IQA {
    question: string;
    type: string;
}


export interface IAiVoiceInterviewModel extends Document {
    employeeId: string;
    questions: IQA[];
    jobPosition: string;
    interviewDuration: string;
    interviewTypes: string[];
    jobDescription: string;
    jobTitle: string;
    interviewFor: string;
    feedBackId: string;
    expiredDate: Date;
    isDeleted?: boolean;
}
