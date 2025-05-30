import { Types } from "mongoose";
import { INotification, NotificationType } from "../../interfaces/INotification";
import { INotificationsRepository } from "../../repositories/interface/INotificationsRepository";
import { UserErrorMessages } from "../../utils/constants";
import { StatusCode } from "../../utils/enums";
import { HttpError } from "../../utils/httpError";
import { INotificationsService } from "../interface/INotificationsService";
import { IEmployeeRepository } from "../../repositories/interface/IEmployeeRepository";
import { userSocketMap } from "../../config/socket";
import { io } from "../..";

export class NotificationsService implements INotificationsService {
    private _notificationsRepository: INotificationsRepository
    private _employeeProfileRepository: IEmployeeRepository

    constructor(_notificationsRepository: INotificationsRepository,
        _employeeProfileRepository: IEmployeeRepository
    ) {
        this._notificationsRepository = _notificationsRepository;
        this._employeeProfileRepository = _employeeProfileRepository;
    }

    async getUserNotifications(id: string): Promise<{
        notifications: INotification[];
        unreadCount: number;
    }> {
        if (!Types.ObjectId.isValid(id)) {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
        }

        const notifications = await this._notificationsRepository.findAll(
            { recipientId: new Types.ObjectId(id) }
        );

        const unreadCount = notifications?.filter(n => !n.read).length || 0;

        return {
            notifications: notifications ?? [],
            unreadCount,
        };
    }

    async updateRead(id: string): Promise<boolean | null> {
        if (!Types.ObjectId.isValid(id)) {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
        }

        const updated = await this._notificationsRepository.updateMany(
            { recipientId: new Types.ObjectId(id) }, { read: true }
        );

        if (updated) {
            return true
        } else {
            return false
        }

    }

    async sendInterviewNotification(payload: {
        link: string;
        userId: string;
        employeeId: string;
        interviewId: string;
    }): Promise<boolean | null> {

        const profile = await this._employeeProfileRepository.findOne({ userId: payload.employeeId });

        if (!profile) {
            return false;
        }

        const notificationPayload = {
            recipientId: new Types.ObjectId(payload.userId),
            senderId: new Types.ObjectId(payload.employeeId),
            content: `${profile.companyName} has invited you to join the interview`,
            link: payload?.link,
            read: false,
            type: "interview" as NotificationType,
            attachments: [profile.logo as string],
            createdAt: new Date(),
        };

        const notification = await this._notificationsRepository.create(notificationPayload);
        const socketId = userSocketMap.get(payload.userId);

        if (socketId && notification) {
            io.to(socketId).emit("notification", {
                content: notification.content,
                image: notification.attachments,
                title: "Interview Alert",
                senderId: payload.employeeId,
            });
        }

        return true;
    }

}