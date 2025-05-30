import { IEmployeeProfile } from "../../interfaces/IEmployeeProfile";
import { IJobPost } from "../../interfaces/IJobPost";
import { IGenericRepository } from "../genericRepository";

export interface IEmployeeRepository extends IGenericRepository<IEmployeeProfile> {
    findAllEmployees(
        page: number,
        pageSize: number,
        querys?: string,
        location?: string,
        omit?: string
    ): Promise<{ employees: any[]; totalEmployees: number }>
}