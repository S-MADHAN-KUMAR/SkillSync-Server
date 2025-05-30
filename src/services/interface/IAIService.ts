import { IAiMockInterview } from "../../interfaces/IAiMockInterviewModel";
import { IAiVoiceInterviewModel } from "../../interfaces/IAiVoiceInterviewModel";
import { IUser } from "../../interfaces/IUser";
import { IvoiceInterviewFeedback } from "../../interfaces/IvoiceInterviewFeedback";
import { Interview, mockINterview } from "../../types/types";

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
    ): Promise<{ interviews: any[] | null; totalInterviews: number }>
    getAllCandidates(): Promise<IUser[] | null>
    getInterview(
        id: string
    ): Promise<{ interview: IAiVoiceInterviewModel; userInfo: IUser; userProfile: any | null } | null>
    checkInterviewAccess(payload: { id: string, userId: string }): Promise<any | null>
    inteviewConversation(payload: { question: string, questions: number, interviewId: string, answer: string, time: any }): Promise<any | null>
    removeVoiceInterview(payload: { id: string }): Promise<boolean | null>
    getFeedback(id: string): Promise<{
        interview: IAiVoiceInterviewModel;
        userInfo: IUser;
        feedback: IvoiceInterviewFeedback | null;
    } | null>
}