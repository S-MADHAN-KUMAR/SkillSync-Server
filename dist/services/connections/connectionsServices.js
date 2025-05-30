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
exports.ConnectionsService = void 0;
const mongoose_1 = require("mongoose");
const __1 = require("../.."); // Import the userSocketMap
class ConnectionsService {
    constructor(connectionsRepository, userRepository, notificationRepository) {
        this._connectionsRepository = connectionsRepository;
        this._userRepository = userRepository;
        this._notificationRepository = notificationRepository;
    }
    request(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const userObjectId = new mongoose_1.Types.ObjectId(payload.userId);
            const connectedUserObjectId = new mongoose_1.Types.ObjectId(payload.connectedUserId);
            const existingConnection = yield this._connectionsRepository.findOne({
                userId: userObjectId,
                connectedUserId: connectedUserObjectId
            });
            // If connection exists and was rejected, update it and notify without creating new notification
            if (existingConnection && existingConnection.status === 'rejected') {
                const updated = yield this._connectionsRepository.findOneAndUpdate({ userId: userObjectId, connectedUserId: connectedUserObjectId }, { status: 'pending' });
                if (!updated) {
                    console.log("Failed to update rejected connection");
                    return null;
                }
                // Create and send notification
                const senderUser = yield this._userRepository.findById(payload.userId);
                const socketId = __1.userSocketMap.get(payload.connectedUserId);
                const notificationPayload = {
                    recipientId: connectedUserObjectId,
                    senderId: userObjectId,
                    content: `${senderUser === null || senderUser === void 0 ? void 0 : senderUser.name} wants to reconnect with you`,
                    read: false,
                    type: 'connection',
                    attachments: [senderUser === null || senderUser === void 0 ? void 0 : senderUser.profile],
                    createdAt: new Date(),
                };
                const notification = yield this._notificationRepository.create(notificationPayload);
                if (socketId && notification) {
                    __1.io.to(socketId).emit("notification", {
                        content: notification.content,
                        image: notification.attachments,
                        title: "New Connection Request",
                        senderId: userObjectId,
                    });
                    console.log(`Notification sent to user ${connectedUserObjectId}`);
                }
                return true;
            }
            // If connection already exists (not rejected), do nothing
            if (existingConnection)
                return false;
            // Create new connection
            const newConnection = yield this._connectionsRepository.create({
                userId: userObjectId,
                connectedUserId: connectedUserObjectId,
                status: 'pending',
            });
            if (!newConnection)
                return null;
            // Create and send notification
            const senderUser = yield this._userRepository.findById(payload.userId);
            const socketId = __1.userSocketMap.get(payload.connectedUserId);
            const notificationPayload = {
                recipientId: connectedUserObjectId,
                senderId: userObjectId,
                content: `${senderUser === null || senderUser === void 0 ? void 0 : senderUser.name} wants to connect with you`,
                read: false,
                type: 'connection',
                attachments: [senderUser === null || senderUser === void 0 ? void 0 : senderUser.profile],
                createdAt: new Date(),
            };
            const notification = yield this._notificationRepository.create(notificationPayload);
            if (socketId && notification) {
                __1.io.to(socketId).emit("notification", {
                    content: notification.content,
                    image: notification.attachments,
                    title: "New Connection Request",
                    senderId: userObjectId,
                });
                console.log(`Notification sent to user ${connectedUserObjectId}`);
            }
            return true;
        });
    }
    makeAllRead(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = new mongoose_1.Types.ObjectId(id);
                const response = yield this._connectionsRepository.updateMany({ userId: userId }, { read: true });
                if (response) {
                    return true;
                }
                else {
                    return false;
                }
            }
            catch (error) {
                console.log(error);
                return false;
            }
        });
    }
    accept(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userObjectId = payload.userId;
                const notificationObjectId = payload.notificationId;
                const connectedUserObjectId = payload.connectedUserId;
                const response = yield this._connectionsRepository.findOneAndUpdate({ $and: [{ userId: userObjectId }, { connectedUserId: connectedUserObjectId }] }, { status: 'accepted' });
                if (response) {
                    const socketId = __1.userSocketMap.get(userObjectId); // fixed: should map the *recipient*, not sender
                    const connectedUser = yield this._userRepository.findById(connectedUserObjectId); // fixed: the one who accepted
                    const notificationPayload = {
                        recipientId: new mongoose_1.Types.ObjectId(userObjectId),
                        senderId: new mongoose_1.Types.ObjectId(connectedUserObjectId),
                        content: `${connectedUser === null || connectedUser === void 0 ? void 0 : connectedUser.name} Accepted your connection`,
                        read: false,
                        type: "message",
                        attachments: [connectedUser === null || connectedUser === void 0 ? void 0 : connectedUser.profile],
                        createdAt: new Date(),
                    };
                    const notification = yield this._notificationRepository.create(notificationPayload);
                    yield this._notificationRepository.delete(notificationObjectId);
                    if (socketId && notification) {
                        __1.io.to(socketId).emit("notification", {
                            content: notification.content,
                            image: notification.attachments,
                            title: "Request Accepted",
                            senderId: userObjectId,
                        });
                        console.log(`Notification sent to user ${connectedUserObjectId.toString()}`);
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
            catch (error) {
                console.log(error);
                return false;
            }
        });
    }
    cancel(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userObjectId = payload.userId;
                const notificationObjectId = payload.notificationId;
                const connectedUserObjectId = payload.connectedUserId;
                const response = yield this._connectionsRepository.findOneAndUpdate({ $and: [{ userId: userObjectId }, { connectedUserId: connectedUserObjectId }] }, { status: 'rejected' });
                if (response) {
                    const socketId = __1.userSocketMap.get(userObjectId); // fixed: should map the *recipient*, not sender
                    const connectedUser = yield this._userRepository.findById(connectedUserObjectId); // fixed: the one who accepted
                    const notificationPayload = {
                        recipientId: new mongoose_1.Types.ObjectId(userObjectId),
                        senderId: new mongoose_1.Types.ObjectId(connectedUserObjectId),
                        content: `${connectedUser === null || connectedUser === void 0 ? void 0 : connectedUser.name} Rejected your connection`,
                        read: false,
                        type: "connection_rejected",
                        attachments: [connectedUser === null || connectedUser === void 0 ? void 0 : connectedUser.profile],
                        createdAt: new Date(),
                    };
                    yield this._notificationRepository.delete(notificationObjectId);
                    const notification = yield this._notificationRepository.create(notificationPayload);
                    if (socketId && notification) {
                        __1.io.to(socketId).emit("notification", {
                            content: notification.content,
                            image: notification.attachments,
                            title: "Request Rejected",
                            senderId: userObjectId,
                        });
                        console.log(`Notification sent to user ${connectedUserObjectId.toString()}`);
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
            catch (error) {
                console.log(error);
                return false;
            }
        });
    }
    // async disconnect(payload: ConnectionRequest): Promise<boolean | null> {
    //     try {
    //         const userObjectId = payload.userId;
    //         const notificationObjectId = payload.notificationId;
    //         const connectedUserObjectId = payload.connectedUserId;
    //         const response = await this._connectionsRepository.findOneAndDelete(
    //             { $and: [{ userId: userObjectId }, { connectedUserId: connectedUserObjectId }] });
    //         if (response) {
    //             const socketId = userSocketMap.get(connectedUserObjectId); // fixed: should map the *recipient*, not sender
    //             const connectedUser = await this._userRepository.findById(userObjectId); // fixed: the one who accepted
    //             const notificationPayload = {
    //                 recipientId: new Types.ObjectId(connectedUserObjectId),
    //                 senderId: new Types.ObjectId(userObjectId),
    //                 content: `${connectedUser?.name} has disconnected from you`,
    //                 read: false,
    //                 type: "disconnected" as NotificationType,
    //                 attachments: [connectedUser?.profile as string],
    //                 createdAt: new Date(),
    //             };
    //             await this._notificationRepository.delete(notificationObjectId as string)
    //             const notification = await this._notificationRepository.create(notificationPayload);
    //             if (socketId && notification) {
    //                 ``
    //                 io.to(socketId).emit("notification", {
    //                     content: notification.content,
    //                     image: notification.attachments,
    //                     title: "Connection disconnected",
    //                     senderId: userObjectId,
    //                 });
    //                 console.log(`Notification sent to user ${connectedUserObjectId.toString()}`);
    //                 return true;
    //             } else {
    //                 return false;
    //             }
    //         } else {
    //             return false;
    //         }
    //     } catch (error) {
    //         console.log(error);
    //         return false;
    //     }
    // }
    disconnect(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userObjectId = payload.userId;
                const connectedUserObjectId = payload.connectedUserId;
                const response = yield this._connectionsRepository.findOneAndDelete({ $and: [{ userId: userObjectId }, { connectedUserId: connectedUserObjectId }] });
                if (response) {
                    const socketId = __1.userSocketMap.get(connectedUserObjectId); // fixed: should map the *recipient*, not sender
                    const connectedUser = yield this._userRepository.findById(userObjectId); // fixed: the one who accepted
                    const notificationPayload = {
                        recipientId: new mongoose_1.Types.ObjectId(connectedUserObjectId),
                        senderId: new mongoose_1.Types.ObjectId(userObjectId),
                        content: `${connectedUser === null || connectedUser === void 0 ? void 0 : connectedUser.name} has disconnected from you`,
                        read: false,
                        type: "disconnected",
                        attachments: [connectedUser === null || connectedUser === void 0 ? void 0 : connectedUser.profile],
                        createdAt: new Date(),
                    };
                    const notification = yield this._notificationRepository.create(notificationPayload);
                    if (socketId && notification) {
                        ``;
                        __1.io.to(socketId).emit("notification", {
                            content: notification.content,
                            image: notification.attachments,
                            title: "Connection disconnected",
                            senderId: userObjectId,
                        });
                        console.log(`Notification sent to user ${connectedUserObjectId.toString()}`);
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
            catch (error) {
                console.log(error);
                return false;
            }
        });
    }
}
exports.ConnectionsService = ConnectionsService;
