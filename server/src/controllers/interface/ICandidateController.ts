import { Request, Response } from "express";

export interface ICandidateControllers {
    updateOrCreate(req: Request, res: Response): Promise<void>;
    getCandidateProfile(req: Request, res: Response): Promise<void>;
}