import { IJobPost } from "../../interfaces/IJobPost";
import { IGenericRepository } from "../genericRepository";

export interface IJobPostRepository extends IGenericRepository<IJobPost> {
    findRecentJobs(id: string): Promise<IJobPost[] | null>
}
