import { Request, Response } from "express";

export interface IApplicationsControllers {
    apply(req: Request, res: Response): Promise<void>
    updateApplicationStatus(req: Request, res: Response): Promise<void>
    getAllApplications(req: Request, res: Response): Promise<void>
    getUserApplications(req: Request, res: Response): Promise<void>
}