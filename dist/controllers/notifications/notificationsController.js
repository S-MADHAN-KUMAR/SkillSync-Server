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
exports.NotificationsController = void 0;
const enums_1 = require("../../utils/enums");
class NotificationsController {
    constructor(_notificationsService) {
        this._notificationsService = _notificationsService;
    }
    getUserNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { notifications, unreadCount } = yield this._notificationsService.getUserNotifications(id);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    notifications,
                    unreadCount,
                });
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message || "Failed to fetch notifications.",
                });
            }
        });
    }
    updateRead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this._notificationsService.updateRead(id);
                if (result) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                    });
                }
                else {
                    res.status(enums_1.StatusCode.OK).json({
                        success: false,
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message || "Failed to fetch notifications.",
                });
            }
        });
    }
    sendInterviewNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const result = yield this._notificationsService.sendInterviewNotification(payload);
                if (result) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        message: "Notification sended successfully!"
                    });
                }
                else {
                    res.status(enums_1.StatusCode.BAD_REQUEST).json({
                        success: false,
                        message: "Notification already sended.",
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
}
exports.NotificationsController = NotificationsController;
