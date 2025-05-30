import { IAiMockInterview } from "../../interfaces/IAiMockInterviewModel";
import aiMockInterviewModel from "../../models/aiMockInterviewModel";
import { GenericRepository } from "../genericRepository";
import { IAIRepository } from "../interface/IAIRepository";


export class AiRepository
    extends GenericRepository<IAiMockInterview>
    implements IAIRepository {
    constructor() {
        super(aiMockInterviewModel);
    }
}