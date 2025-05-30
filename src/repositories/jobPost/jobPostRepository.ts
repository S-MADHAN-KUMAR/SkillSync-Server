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

    async findRecentJobs(employeeId: string): Promise<IJobPost[]> {
        try {
            const jobs = await jobPostModel
                .find({ employeeId })
                .sort({ postedAt: -1 })
                .limit(10);

            return jobs;
        } catch (error) {
            console.error('Error fetching recent jobs:', error);
            throw new Error('Failed to fetch recent jobs');
        }
    }

}