import { Request, Response } from "express";

export interface IAIController {
    createMockInterview(req: Request, res: Response): Promise<void>
    getMockInterview(req: Request, res: Response): Promise<void>
    saveAnswer(req: Request, res: Response): Promise<void>
    getAllMockInterviews(req: Request, res: Response): Promise<void>
    checkAiAccess(req: Request, res: Response): Promise<void>
    removeInterview(req: Request, res: Response): Promise<void>
    createInterview(req: Request, res: Response): Promise<void>
    getAllVoiceInterviews(req: Request, res: Response): Promise<void>
    getAllCandidates(req: Request, res: Response): Promise<void>
    getInterview(req: Request, res: Response): Promise<void>
    checkInterviewAccess(req: Request, res: Response): Promise<void>
    askAnswer(req: Request, res: Response): Promise<void>
    getFeedback(req: Request, res: Response): Promise<void>
    removeVoiceInterview(req: Request, res: Response): Promise<void>
}