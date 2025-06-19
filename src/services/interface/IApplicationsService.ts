import { IApplicationModel } from "../../interfaces/IApplicationModel";
import { IJobPost } from "../../interfaces/IJobPost";

export interface IApplicationsService {
    apply(payload: {
        jobId: string,
        candidateId: string
    }): Promise<{ status: 'applied' | 'reviewed' | 'interview' | 'hired' | 'rejected' | null }>
    getAllApplications(payload: {
        page: number;
        pageSize: number;
        query: string; // corrected from 'querys'
        jobId: string;
    }): Promise<{
        applications: IApplicationModel[];
        totalPages: number;
    } | null>
    updateApplicationStatus(payload: { id: string, status: "applied" | "reviewed" | "interview" | "hired" | "rejected" }): Promise<boolean | null>

    getUserApplications(payload: {
        page: number;
        pageSize: number;
        query: string;
        userId: string;
    }): Promise<{
        applications: IApplicationModel[]; // or your proper typed output
        totalPages: number;
    } | null>
}