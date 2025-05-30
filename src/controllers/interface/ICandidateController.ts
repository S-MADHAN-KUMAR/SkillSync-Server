import { Request, Response } from "express";

export interface ICandidateControllers {
    updateOrCreate(req: Request, res: Response): Promise<void>;
    getCandidateProfile(req: Request, res: Response): Promise<void>;
    getAllCandidates(req: Request, res: Response): Promise<void>
    getAllSavedJobs(req: Request, res: Response): Promise<void>
    saveJob(req: Request, res: Response): Promise<void>
    removeSavedJob(req: Request, res: Response): Promise<void>
    getStatistics(req: Request, res: Response): Promise<void>
    getConnectedUsers(req: Request, res: Response): Promise<void>
    messageTo(req: Request, res: Response): Promise<void>
    getMessages(req: Request, res: Response): Promise<void>
    getUnSeenMessageCount(req: Request, res: Response): Promise<void>
    removeMessage(req: Request, res: Response): Promise<void>
    updateSeen(req: Request, res: Response): Promise<void>
    updateEditMessage(req: Request, res: Response): Promise<void>
}