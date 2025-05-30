import { Request, Response } from "express";

export interface IAdminControllers {
    adminLogin(req: Request, res: Response): Promise<void>
    getCandidates(req: Request, res: Response): Promise<void>
    getEmployees(req: Request, res: Response): Promise<void>
    toggleStatus(req: Request, res: Response): Promise<void>
    getPosts(req: Request, res: Response): Promise<void>
    logout(req: Request, res: Response): Promise<void>
    togglePostStatus(req: Request, res: Response): Promise<void>
    toggleAiAccessStatus(req: Request, res: Response): Promise<void>
    getStatistics(req: Request, res: Response): Promise<void>
}