import { INotification } from "../../interfaces/INotification";

export interface INotificationsService {
    getUserNotifications(id: string): Promise<{
        notifications: INotification[];
        unreadCount: number;
    }>
    updateRead(id: string): Promise<boolean | null>
    sendInterviewNotification(payload: {
        link: string;
        userId: string;
        employeeId: string;
        interviewId: string;
    }): Promise<boolean | null>
}