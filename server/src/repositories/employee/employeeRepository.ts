import { IEmployeeProfile } from "../../interfaces/IEmployeeProfile";
import employeeProfileModel from "../../models/employeeProfileModel";
import { GenericRepository } from "../genericRepository";
import { IEmployeeRepository } from "../interface/IEmployeeRepository";


export class EmployeeRepository
    extends GenericRepository<IEmployeeProfile>
    implements IEmployeeRepository {
    constructor() {
        super(employeeProfileModel);
    }
}

