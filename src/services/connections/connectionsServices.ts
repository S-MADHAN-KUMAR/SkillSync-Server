import { Types } from "mongoose";
import { IConnectionsRepository } from "../../repositories/interface/IConnectionsRepository";
import { IUserRepository } from "../../repositories/interface/IUserRepository";
import { ConnectionRequest } from "../../types/types";
import { IConnectionsService } from "../interface/IConnectionsService";
import { io, userSocketMap } from "../.."; // Import the userSocketMap
import { INotificationsRepository } from "../../repositories/interface/INotificationsRepository";
import { INotification, NotificationType } from "../../interfaces/INotification";

export class ConnectionsService implements IConnectionsService {
    private _connectionsRepository: IConnectionsRepository;
    private _userRepository: IUserRepository;
    private _notificationRepository: INotificationsRepository;

    constructor(
        connectionsRepository: IConnectionsRepository,
        userRepository: IUserRepository,
        notificationRepository: INotificationsRepository
    ) {
        this._connectionsRepository = connectionsRepository;
        this._userRepository = userRepository;
        this._notificationRepository = notificationRepository;
    }

    async request(payload: ConnectionRequest): Promise<boolean | null> {
        const userObjectId = new Types.ObjectId(payload.userId);
        const connectedUserObjectId = new Types.ObjectId(payload.connectedUserId);

        const existingConnection = await this._connectionsRepository.findOne({
            userId: userObjectId,
            connectedUserId: connectedUserObjectId
        });

        // If connection exists and was rejected, update it and notify without creating new notification
        if (existingConnection && existingConnection.status === 'rejected') {
            const updated = await this._connectionsRepository.findOneAndUpdate(
                { userId: userObjectId, connectedUserId: connectedUserObjectId },
                { status: 'pending' }
            );

            if (!updated) {
                console.log("Failed to update rejected connection");
                return null;
            }

            // Create and send notification
            const senderUser = await this._userRepository.findById(payload.userId);
            const socketId = userSocketMap.get(payload.connectedUserId);

            const notificationPayload = {
                recipientId: connectedUserObjectId,
                senderId: userObjectId,
                content: `${senderUser?.name} wants to reconnect with you`,
                read: false,
                type: 'connection' as NotificationType,
                attachments: [senderUser?.profile as string],
                createdAt: new Date(),
            };

            const notification = await this._notificationRepository.create(notificationPayload);

            if (socketId && notification) {
                io.to(socketId).emit("notification", {
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
        if (existingConnection) return false;

        // Create new connection
        const newConnection = await this._connectionsRepository.create({
            userId: userObjectId,
            connectedUserId: connectedUserObjectId,
            status: 'pending',
        });

        if (!newConnection) return null;

        // Create and send notification
        const senderUser = await this._userRepository.findById(payload.userId);
        const socketId = userSocketMap.get(payload.connectedUserId);

        const notificationPayload = {
            recipientId: connectedUserObjectId,
            senderId: userObjectId,
            content: `${senderUser?.name} wants to connect with you`,
            read: false,
            type: 'connection' as NotificationType,
            attachments: [senderUser?.profile as string],
            createdAt: new Date(),
        };

        const notification = await this._notificationRepository.create(notificationPayload);

        if (socketId && notification) {
            io.to(socketId).emit("notification", {
                content: notification.content,
                image: notification.attachments,
                title: "New Connection Request",
                senderId: userObjectId,
            });

            console.log(`Notification sent to user ${connectedUserObjectId}`);
        }

        return true;
    }


    async makeAllRead(id: string): Promise<boolean | null> {
        try {
            const userId = new Types.ObjectId(id);
            const response = await this._connectionsRepository.updateMany({ userId: userId }, { read: true })
            if (response) {
                return true
            } else {
                return false
            }
        } catch (error) {
            console.log(error);
            return false
        }
    }

    async accept(payload: ConnectionRequest): Promise<boolean | null> {
        try {
            const userObjectId = payload.userId;
            const notificationObjectId = payload.notificationId;
            const connectedUserObjectId = payload.connectedUserId;

            const response = await this._connectionsRepository.findOneAndUpdate(
                { $and: [{ userId: userObjectId }, { connectedUserId: connectedUserObjectId }] },
                { status: 'accepted' }
            );

            if (response) {
                const socketId = userSocketMap.get(userObjectId); // fixed: should map the *recipient*, not sender

                const connectedUser = await this._userRepository.findById(connectedUserObjectId); // fixed: the one who accepted

                const notificationPayload = {
                    recipientId: new Types.ObjectId(userObjectId),
                    senderId: new Types.ObjectId(connectedUserObjectId),
                    content: `${connectedUser?.name} Accepted your connection`,
                    read: false,
                    type: "message" as NotificationType,
                    attachments: [connectedUser?.profile as string],
                    createdAt: new Date(),
                };


                const notification = await this._notificationRepository.create(notificationPayload);
                await this._notificationRepository.delete(notificationObjectId as string)

                if (socketId && notification) {
                    io.to(socketId).emit("notification", {
                        content: notification.content,
                        image: notification.attachments,
                        title: "Request Accepted",
                        senderId: userObjectId,
                    });

                    console.log(`Notification sent to user ${connectedUserObjectId.toString()}`);
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async cancel(payload: ConnectionRequest): Promise<boolean | null> {
        try {
            const userObjectId = payload.userId;
            const notificationObjectId = payload.notificationId;
            const connectedUserObjectId = payload.connectedUserId;

            const response = await this._connectionsRepository.findOneAndUpdate(
                { $and: [{ userId: userObjectId }, { connectedUserId: connectedUserObjectId }] },
                { status: 'rejected' }
            );

            if (response) {
                const socketId = userSocketMap.get(userObjectId); // fixed: should map the *recipient*, not sender

                const connectedUser = await this._userRepository.findById(connectedUserObjectId); // fixed: the one who accepted

                const notificationPayload = {
                    recipientId: new Types.ObjectId(userObjectId),
                    senderId: new Types.ObjectId(connectedUserObjectId),
                    content: `${connectedUser?.name} Rejected your connection`,
                    read: false,
                    type: "connection_rejected" as NotificationType,
                    attachments: [connectedUser?.profile as string],
                    createdAt: new Date(),
                };


                await this._notificationRepository.delete(notificationObjectId as string)
                const notification = await this._notificationRepository.create(notificationPayload);

                if (socketId && notification) {
                    io.to(socketId).emit("notification", {
                        content: notification.content,
                        image: notification.attachments,
                        title: "Request Rejected",
                        senderId: userObjectId,
                    });

                    console.log(`Notification sent to user ${connectedUserObjectId.toString()}`);
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } catch (error) {
            console.log(error);
            return false;
        }
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


    async disconnect(payload: ConnectionRequest): Promise<boolean | null> {

        try {
            const userObjectId = payload.userId;
            const connectedUserObjectId = payload.connectedUserId;

            const response = await this._connectionsRepository.findOneAndDelete(
                { $and: [{ userId: userObjectId }, { connectedUserId: connectedUserObjectId }] });

            if (response) {
                const socketId = userSocketMap.get(connectedUserObjectId); // fixed: should map the *recipient*, not sender

                const connectedUser = await this._userRepository.findById(userObjectId); // fixed: the one who accepted

                const notificationPayload = {
                    recipientId: new Types.ObjectId(connectedUserObjectId),
                    senderId: new Types.ObjectId(userObjectId),
                    content: `${connectedUser?.name} has disconnected from you`,
                    read: false,
                    type: "disconnected" as NotificationType,
                    attachments: [connectedUser?.profile as string],
                    createdAt: new Date(),
                };

                const notification = await this._notificationRepository.create(notificationPayload);

                if (socketId && notification) {
                    ``
                    io.to(socketId).emit("notification", {
                        content: notification.content,
                        image: notification.attachments,
                        title: "Connection disconnected",
                        senderId: userObjectId,
                    });

                    console.log(`Notification sent to user ${connectedUserObjectId.toString()}`);
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } catch (error) {
            console.log(error);
            return false;
        }


    }
}
