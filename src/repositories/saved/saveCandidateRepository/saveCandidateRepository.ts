import { ISavedCandidate } from "../../../interfaces/ISavedCandidate";
import { savedCandidateModel } from "../../../models/saveCandidateModel";
import { GenericRepository } from "../../genericRepository";
import { ISaveCandidateRepository } from "../../interface/ISaveCandidateRepository";

export class SaveCandidateRepository
    extends GenericRepository<ISavedCandidate>
    implements ISaveCandidateRepository {
    constructor() {
        super(savedCandidateModel);
    }
}
