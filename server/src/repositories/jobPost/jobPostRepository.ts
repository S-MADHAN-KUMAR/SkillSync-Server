import { IJobPost } from "../../interfaces/IJobPost";
import jobPostModel from "../../models/jobPostModel";
import { GenericRepository } from "../genericRepository";
import { IJobPostRepository } from "../interface/IJobPostRepository";

export class JobRepository
    extends GenericRepository<IJobPost>
    implements IJobPostRepository {
    constructor() {
        super(jobPostModel);
    }

    async findRecentJobs(): Promise<IJobPost[] | null> {
        try {
            const response = await jobPostModel.find().sort({ postedAt: -1 }).limit(10)
            return response;
        } catch (error) {
            throw error;
        }
    }
}