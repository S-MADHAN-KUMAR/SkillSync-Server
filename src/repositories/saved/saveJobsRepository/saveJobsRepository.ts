import { ISavedJobs } from "../../../interfaces/IISavedJobs";
import { savedJobsModel } from "../../../models/saveJobsModel";
import { GenericRepository } from "../../genericRepository";
import { ISaveJobsRepository } from "../../interface/ISaveJobsRepository";

export class SaveJobsRepository
    extends GenericRepository<ISavedJobs>
    implements ISaveJobsRepository {
    constructor() {
        super(savedJobsModel);
    }
}
