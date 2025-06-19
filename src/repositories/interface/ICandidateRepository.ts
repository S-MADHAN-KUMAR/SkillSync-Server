
import { ICandidateProfile } from "../../interfaces/ICandidateProfile";
import { IGenericRepository } from "../genericRepository";

export interface ICandidateRepository extends IGenericRepository<ICandidateProfile> {
    findAllCandidates(
        page: number,
        pageSize: number,
        querys?: string,
        location?: string,
        userId?: string,
        omit?: string
    ): Promise<{ candidates: ICandidateProfile[]; totalCandidates: number }>
}