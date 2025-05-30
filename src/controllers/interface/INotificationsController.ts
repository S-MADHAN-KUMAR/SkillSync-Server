import { Request, Response } from "express";

export interface INotificationsController {
    getUserNotifications(req: Request, res: Response): Promise<void>
    updateRead(req: Request, res: Response): Promise<void>
    sendInterviewNotification(req: Request, res: Response): Promise<void>
}