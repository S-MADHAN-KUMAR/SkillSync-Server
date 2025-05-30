import { IvoiceInterviewFeedback } from "../../interfaces/IvoiceInterviewFeedback";
import voiceInterviewFeedbackModel from "../../models/voiceInterviewFeedbackModel";
import { GenericRepository } from "../genericRepository";
import { IVoiceInterviewFeedbackRepository } from "../interface/IVoiceInterviewFeedbackRepository";

export class VoiceInterviewFeedbackRepository
    extends GenericRepository<IvoiceInterviewFeedback>
    implements IVoiceInterviewFeedbackRepository {
    constructor() {
        super(voiceInterviewFeedbackModel);
    }
}