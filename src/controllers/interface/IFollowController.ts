import { Request, Response } from "express";

export interface IFollowController {
    request(req: Request, res: Response): Promise<void>
    accept(req: Request, res: Response): Promise<void>
    cancel(req: Request, res: Response): Promise<void>
    unfollow(req: Request, res: Response): Promise<void>
}