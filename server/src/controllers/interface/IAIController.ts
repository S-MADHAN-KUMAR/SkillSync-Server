import { Request, Response } from "express";

export interface IAIController {
    createMockInterview(req: Request, res: Response): Promise<void>
    getMockInterview(req: Request, res: Response): Promise<void>
    saveAnswer(req: Request, res: Response): Promise<void>
    getAllMockInterviews(req: Request, res: Response): Promise<void>
}