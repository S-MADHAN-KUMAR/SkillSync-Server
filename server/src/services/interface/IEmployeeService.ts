import { IEmployeeProfile } from "../../interfaces/IEmployeeProfile";
import { IJobPost } from "../../interfaces/IJobPost";
import { IUser } from "../../interfaces/IUser";

export interface IEmployeeService {
    updateOrCreate(payload: IEmployeeProfile, id: string): Promise<{ response: IEmployeeProfile | null, userData: IUser | null }>;
    getEmployeeProfile(id: string): Promise<IEmployeeProfile | null>;
    createJob(payload: IJobPost): Promise<IJobPost | null>;
    getAllJobs(page: number, pageSize: number): Promise<{ jobs: IJobPost[] | null, totalJobs: number }>
    getRecentJobs(): Promise<IJobPost[] | null>;
    editJob(id: string, payload: IJobPost): Promise<IJobPost | null>;
    getJobs(id: string): Promise<IJobPost | null>
    updateJob(payload: IJobPost, id: string): Promise<IJobPost | null>
    removeJob(id: string): Promise<Boolean | null>
}