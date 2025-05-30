"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("../../utils/constants");
const enums_1 = require("../../utils/enums");
const httpError_1 = require("../../utils/httpError");
const socket_1 = require("../../config/socket");
const __1 = require("../..");
class NotificationsService {
    constructor(_notificationsRepository, _employeeProfileRepository) {
        this._notificationsRepository = _notificationsRepository;
        this._employeeProfileRepository = _employeeProfileRepository;
    }
    getUserNotifications(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
            const notifications = yield this._notificationsRepository.findAll({ recipientId: new mongoose_1.Types.ObjectId(id) });
            const unreadCount = (notifications === null || notifications === void 0 ? void 0 : notifications.filter(n => !n.read).length) || 0;
            return {
                notifications: notifications !== null && notifications !== void 0 ? notifications : [],
                unreadCount,
            };
        });
    }
    updateRead(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
            const updated = yield this._notificationsRepository.updateMany({ recipientId: new mongoose_1.Types.ObjectId(id) }, { read: true });
            if (updated) {
                return true;
            }
            else {
                return false;
            }
        });
    }
    sendInterviewNotification(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield this._employeeProfileRepository.findOne({ userId: payload.employeeId });
            if (!profile) {
                return false;
            }
            const notificationPayload = {
                recipientId: new mongoose_1.Types.ObjectId(payload.userId),
                senderId: new mongoose_1.Types.ObjectId(payload.employeeId),
                content: `${profile.companyName} has invited you to join the interview`,
                link: payload === null || payload === void 0 ? void 0 : payload.link,
                read: false,
                type: "interview",
                attachments: [profile.logo],
                createdAt: new Date(),
            };
            const notification = yield this._notificationsRepository.create(notificationPayload);
            const socketId = socket_1.userSocketMap.get(payload.userId);
            if (socketId && notification) {
                __1.io.to(socketId).emit("notification", {
                    content: notification.content,
                    image: notification.attachments,
                    title: "Interview Alert",
                    senderId: payload.employeeId,
                });
            }
            return true;
        });
    }
}
exports.NotificationsService = NotificationsService;
