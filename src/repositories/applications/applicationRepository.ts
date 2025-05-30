import { IApplicationModel } from "../../interfaces/IApplicationModel";
import applicationModel from "../../models/applicationModel";
import { GenericRepository } from "../genericRepository";
import { IApplicationsRepository } from "../interface/IApplicationsRepository";

export class ApplicationsRepository
    extends GenericRepository<IApplicationModel>
    implements IApplicationsRepository {
    constructor() {
        super(applicationModel);
    }
}