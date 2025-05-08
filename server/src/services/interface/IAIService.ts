import { IAiMockInterview } from "../../interfaces/IAiMockInterviewModel";
import { mockINterview } from "../../types/types";

export interface IAIService {
    createMockInterview(payload: mockINterview, id: string): Promise<IAiMockInterview | null>
    getMockInterview(id: string): Promise<IAiMockInterview | null>
}