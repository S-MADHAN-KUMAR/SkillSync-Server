import { Request, Response } from "express";

export interface IAdminControllers {
    adminLogin(req: Request, res: Response): Promise<void>
    getCandidates(req: Request, res: Response): Promise<void>
    getEmployees(req: Request, res: Response): Promise<void>
    toggleStatus(req: Request, res: Response): Promise<void>
    logout(req: Request, res: Response): Promise<void>
}