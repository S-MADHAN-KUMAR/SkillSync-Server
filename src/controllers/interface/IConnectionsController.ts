import { Request, Response } from "express";

export interface IConnectionsController {
    request(req: Request, res: Response): Promise<void>
    accept(req: Request, res: Response): Promise<void>
    cancel(req: Request, res: Response): Promise<void>
    update(req: Request, res: Response): Promise<void>
    disconnect(req: Request, res: Response): Promise<void>
}