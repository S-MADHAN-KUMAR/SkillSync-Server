import { IApplicationModel } from "../../interfaces/IApplicationModel";
import { IJobPost } from "../../interfaces/IJobPost";

export interface IApplicationsService {
    apply(payload: any): Promise<boolean | null>
    getAllApplications(payload: {
        page: number;
        pageSize: number;
        query: string; // corrected from 'querys'
        jobId: string;
    }): Promise<{
        applications: IApplicationModel[];
        totalPages: number;
    } | null>
    updateApplicationStatus(payload: any): Promise<boolean | null>

    getUserApplications(payload: {
        page: number;
        pageSize: number;
        query: string;
        userId: string;
    }): Promise<{
        applications: any[]; // or your proper typed output
        totalPages: number;
    } | null>
}