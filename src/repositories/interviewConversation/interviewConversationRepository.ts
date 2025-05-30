import { IInterviewConversation } from "../../interfaces/IInterviewConversation";
import interviewConversationModel from "../../models/interviewConversationModel";
import { GenericRepository } from "../genericRepository";
import { IInterviewConversationRepository } from "../interface/IInterviewConversationRepository";

export class InterviewConversationRepository
    extends GenericRepository<IInterviewConversation>
    implements IInterviewConversationRepository {
    constructor() {
        super(interviewConversationModel);
    }
}
