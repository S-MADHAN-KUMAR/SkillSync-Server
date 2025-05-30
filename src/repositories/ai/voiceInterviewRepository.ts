import { IAiVoiceInterviewModel } from "../../interfaces/IAiVoiceInterviewModel";
import aiVoiceInterviewModel from "../../models/aiVoiceInterviewModel";
import { GenericRepository } from "../genericRepository";
import { IVoiceInterviewRepository } from "../interface/IVoiceInterviewRepository";

export class VoiceInterviewRepository
    extends GenericRepository<IAiVoiceInterviewModel>
    implements IVoiceInterviewRepository {
    constructor() {
        super(aiVoiceInterviewModel);
    }
}