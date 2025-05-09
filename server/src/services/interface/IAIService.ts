import { IAiMockInterview } from "../../interfaces/IAiMockInterviewModel";
import { mockINterview } from "../../types/types";

export interface IAIService {
    createMockInterview(payload: mockINterview, id: string): Promise<IAiMockInterview | null>
    getMockInterview(id: string): Promise<IAiMockInterview | null>
    saveAnswer(payload: { feedback: string, questionId: string, userAnswer: string }, id: string): Promise<IAiMockInterview | null>
    getAllMockInterviews(id: string): Promise<IAiMockInterview[] | null>
}