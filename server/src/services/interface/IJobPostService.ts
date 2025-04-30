import { IJobPost } from "../../interfaces/IJobPost";

export interface IJobPostService {
    createJob(payload: IJobPost): Promise<IJobPost | null>;
}