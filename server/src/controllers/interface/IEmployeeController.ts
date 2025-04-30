import { Request, Response } from "express";

export interface IEmployeeController {
    updateOrCreate(req: Request, res: Response): Promise<void>;
    getEmployeeProfile(req: Request, res: Response): Promise<void>;
    createJob(req: Request, res: Response): Promise<void>
    getAllJobs(req: Request, res: Response): Promise<void>
    getRecentJobs(req: Request, res: Response): Promise<void>
    editJob(req: Request, res: Response): Promise<void>
    getJobs(req: Request, res: Response): Promise<void>
    updateJob(req: Request, res: Response): Promise<void>
    removeJob(req: Request, res: Response): Promise<void>
}