
import { INotification } from "../../interfaces/INotification";
import notificationModel from "../../models/notificationModel";
import { GenericRepository } from "../genericRepository";
import { INotificationsRepository } from "../interface/INotificationsRepository";


export class NotificationsRepository
    extends GenericRepository<INotification>
    implements INotificationsRepository {
    constructor() {
        super(notificationModel);
    }
}
