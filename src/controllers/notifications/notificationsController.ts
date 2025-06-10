import { Request, Response } from "express";
import { INotificationsService } from "../../services/interface/INotificationsService";
import { INotificationsController } from "../interface/INotificationsController";
import { StatusCode } from "../../utils/enums";

export class NotificationsController implements INotificationsController {
    private _notificationsService: INotificationsService;
    constructor(_notificationsService: INotificationsService) {
        this._notificationsService = _notificationsService;
    }

    async getUserNotifications(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const { notifications, unreadCount } = await this._notificationsService.getUserNotifications(id);

            res.status(StatusCode.OK).json({
                success: true,
                notifications,
                unreadCount,
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message || "Failed to fetch notifications.",
            });
        }
    }

    async updateRead(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const result = await this._notificationsService.updateRead(id);
            if (result) {
                res.status(StatusCode.OK).json({
                    success: true,
                });
            } else {
                res.status(StatusCode.OK).json({
                    success: false,
                });
            }
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message || "Failed to fetch notifications.",
            });
        }
    }

    async sendInterviewNotification(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body
            const result = await this._notificationsService.sendInterviewNotification(payload);
            if (result) {
                res.status(StatusCode.OK).json({
                    success: true,
                    message: "Notification sended successfully!"
                });
            } else {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Notification already sended.",
                });
            }
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }
}