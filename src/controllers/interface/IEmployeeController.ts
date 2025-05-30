import { Request, Response } from "express";

export interface IEmployeeController {
    updateOrCreate(req: Request, res: Response): Promise<void>;
    getEmployeeProfile(req: Request, res: Response): Promise<void>;
    createJob(req: Request, res: Response): Promise<void>
    getAllJobs(req: Request, res: Response): Promise<void>
    getRecentJobs(req: Request, res: Response): Promise<void>
    editJob(req: Request, res: Response): Promise<void>
    getJobs(req: Request, res: Response): Promise<void>
    getJob(req: Request, res: Response): Promise<void>
    updateJob(req: Request, res: Response): Promise<void>
    toggleStatus(req: Request, res: Response): Promise<void>
    getAllEmployees(req: Request, res: Response): Promise<void>
    getEmployeeDetail(req: Request, res: Response): Promise<void>
    getStatistics(req: Request, res: Response): Promise<void>
}