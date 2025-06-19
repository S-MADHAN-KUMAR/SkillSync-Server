import { IAiMockInterview } from "../../interfaces/IAiMockInterviewModel";
import { IAiVoiceInterviewModel } from "../../interfaces/IAiVoiceInterviewModel";
import { ICandidateProfile } from "../../interfaces/ICandidateProfile";
import { IEmployeeProfile } from "../../interfaces/IEmployeeProfile";
import { IInterviewConversation } from "../../interfaces/IInterviewConversation";
import { IUser } from "../../interfaces/IUser";
import { IvoiceInterviewFeedback } from "../../interfaces/IvoiceInterviewFeedback";
import { Interview, mockINterview } from "../../types/types";
import { VoiceInterviewWithUserInfo } from "../ai/aiService";

export interface IAIService {
    createMockInterview(payload: mockINterview, id: string): Promise<IAiMockInterview | null>
    createInterview(payload: Interview, id: string): Promise<IAiVoiceInterviewModel | null>
    getMockInterview(id: string): Promise<IAiMockInterview | null>
    saveAnswer(payload: { feedback: string, questionId: string, userAnswer: string }, id: string): Promise<IAiMockInterview | null>
    getAllMockInterviews(
        page: number,
        pageSize: number,
        querys?: string,
        id?: string,
    ): Promise<{ interviews: IAiMockInterview[] | null; totalInterviews: number }>
    checkAiAccess(id: string): Promise<{ user: IUser; isHaveAccess: boolean } | null>
    removeInterview(payload: { id: string, userId: string }): Promise<boolean | null>
    getAllVoiceInterviews(
        page: number,
        pageSize: number,
        querys?: string,
        id?: string,
    ): Promise<{
        interviews: any[];
        totalInterviews: number;
    }>

    getAllCandidates(): Promise<IUser[] | null>
    getInterview(
        id: string
    ): Promise<{ interview: IAiVoiceInterviewModel; userInfo: IUser; userProfile: ICandidateProfile | IEmployeeProfile | null } | null>
    checkInterviewAccess(payload: { id: string, userId: string }): Promise<{ interview: IAiVoiceInterviewModel, userInfo: IUser | null } | null>
    interviewConversation(payload: {
        question: string;
        questions: number;
        interviewId: string;
        answer: string;
        time: Date;
    }): Promise<string | null>
    removeVoiceInterview(payload: { id: string }): Promise<boolean | null>
    getFeedback(id: string): Promise<{
        interview: IAiVoiceInterviewModel;
        userInfo: IUser;
        feedback: IvoiceInterviewFeedback | null;
    } | null>
}