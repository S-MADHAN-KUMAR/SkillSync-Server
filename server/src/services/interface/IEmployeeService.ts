import { IEmployeeProfile } from "../../interfaces/IEmployeeProfile";
import { IJobPost } from "../../interfaces/IJobPost";
import { IUser } from "../../interfaces/IUser";

export interface IEmployeeService {
    updateOrCreate(payload: IEmployeeProfile, id: string): Promise<{ response: IEmployeeProfile | null, userData: IUser | null }>;
    getEmployeeProfile(id: string): Promise<IEmployeeProfile | null>;
    createJob(payload: IJobPost): Promise<IJobPost | null>;
    getAllJobs(
        page: number,
        pageSize: number,
        querys?: string,
        location?: string,
        jobType?: string,
        salary?: string,
        skill?: string,
        active?: boolean,
        expiredBefore?: Date
    ): Promise<{ jobs: IJobPost[] | null; totalJobs: number }>
    getRecentJobs(): Promise<IJobPost[] | null>;
    editJob(id: string, payload: IJobPost): Promise<IJobPost | null>;
    getJobs(id: string): Promise<IJobPost | null>
    updateJob(payload: IJobPost, id: string): Promise<IJobPost | null>
    toggleStatus(id: string, status: boolean): Promise<Boolean | null>
}