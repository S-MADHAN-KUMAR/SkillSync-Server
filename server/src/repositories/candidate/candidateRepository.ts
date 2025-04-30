
import { ICandidateProfile } from "../../interfaces/ICandidateProfile";
import candidateProfileModel from "../../models/candidateProfileModel";
import { GenericRepository } from "../genericRepository";
import { ICandidateRepository } from "../interface/ICandidateRepository";


export class CandidateRepository
    extends GenericRepository<ICandidateProfile>
    implements ICandidateRepository {
    constructor() {
        super(candidateProfileModel);
    }
}