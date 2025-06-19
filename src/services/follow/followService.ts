import { Types } from "mongoose";
import { IFollowRepository } from "../../repositories/interface/IFollowRepository";
import { INotificationsRepository } from "../../repositories/interface/INotificationsRepository";
import { IUserRepository } from "../../repositories/interface/IUserRepository";
import { FollowRequest, IFollowService } from "../interface/IFollowService";
import { io, userSocketMap } from "../..";
import { NotificationType } from "../../interfaces/INotification";
import { IEmployeeRepository } from "../../repositories/interface/IEmployeeRepository";
import { ICandidateProfile } from "../../interfaces/ICandidateProfile";
import { IUser } from "../../interfaces/IUser";
import { IEmployeeProfile } from "../../interfaces/IEmployeeProfile";
import { ICandidateRepository } from "../../repositories/interface/ICandidateRepository";

export class FollowService implements IFollowService {
    private _followRepository: IFollowRepository;
    private _userRepository: IUserRepository;
    private _profileRepository: IEmployeeRepository;
    private _notificationRepository: INotificationsRepository;

    constructor(
        _followRepository: IFollowRepository,
        _userRepository: IUserRepository,
        _notificationRepository: INotificationsRepository,
        _profileRepository: IEmployeeRepository
    ) {
        this._followRepository = _followRepository;
        this._userRepository = _userRepository;
        this._notificationRepository = _notificationRepository;
        this._profileRepository = _profileRepository;
    }

    async request(payload: FollowRequest): Promise<boolean | null> {
        const userObjectId = new Types.ObjectId(payload.userId);
        const followingUserObjectId = new Types.ObjectId(payload.followingId);
        const userType = payload.userType;

        const existingFollow = await this._followRepository.findOne({
            userId: userObjectId,
            followingId: followingUserObjectId,
            userType
        });

        // If previously rejected, update to pending and send notification
        if (existingFollow?.status === 'rejected') {
            const updated = await this._followRepository.findOneAndUpdate(
                { userId: userObjectId, followingId: followingUserObjectId, userType },
                { status: 'pending' }
            );

            if (!updated) {
                console.log("Failed to update rejected connection");
                return null;
            }

            await this.sendFollowNotification(payload, userObjectId, followingUserObjectId, userType);
            return true;
        }

        // If already exists and not rejected, do nothing
        if (existingFollow) return false;

        // Create new follow record
        const newFollow = await this._followRepository.create({
            userId: followingUserObjectId,
            followingId: userObjectId,
            status: 'pending',
            userType
        });

        if (!newFollow) return null;

        await this.sendFollowNotification(payload, userObjectId, followingUserObjectId, userType);
        return true;
    }

    async accept(payload: FollowRequest): Promise<boolean | null> {
        try {
            const userObjectId = new Types.ObjectId(payload.userId);
            const followingUserObjectId = new Types.ObjectId(payload.followingId);
            const notificationObjectId = new Types.ObjectId(payload.notificationId);

            const response = await this._followRepository.findOneAndUpdate(
                { userId: userObjectId, followingId: followingUserObjectId },
                { status: 'accepted' }
            );

            if (!response) return null;



            const userType = response.userType === 'candidate' ? "company" : "candidate"
            const socketId = userSocketMap.get(payload.followingId);
            let senderProfile: ICandidateProfile | IEmployeeProfile | IUser | null

            if (userType === 'candidate') {
                senderProfile = await this._userRepository.findById(payload.userId);
            } else {
                senderProfile = await this._profileRepository.findOne({ userId: payload.userId });
            }

            const content = userType === 'candidate'
                ? senderProfile?.name
                : senderProfile?.companyName;

            const attachments = userType === 'candidate'
                ? [senderProfile?.profile]
                : [senderProfile?.logo, senderProfile?.banner];

            const notificationPayload = {
                recipientId: followingUserObjectId,
                senderId: userObjectId,
                content: `${content} ${userType} accepted your follow request`,
                read: false,
                type: 'message' as NotificationType,
                attachments,
                createdAt: new Date(),
            };

            const filteredAttachments = attachments.filter((a): a is string => typeof a === 'string');
            const notification = await this._notificationRepository.create({
                ...notificationPayload,
                attachments: filteredAttachments,
            });
            await this._notificationRepository.delete(notificationObjectId.toString())

            if (socketId && notification) {
                io.to(socketId).emit("notification", {
                    content: notification.content,
                    image: notification.attachments,
                    title: "Request Accepted",
                    senderId: userObjectId,
                });
                console.log(`Notification sent to user ${payload.followingId}`);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log(error);
            return false;
        }
    }


    async cancel(payload: FollowRequest): Promise<boolean | null> {
        try {
            const userObjectId = new Types.ObjectId(payload.userId);
            const followingUserObjectId = new Types.ObjectId(payload.followingId);
            const notificationObjectId = new Types.ObjectId(payload.notificationId);

            const response = await this._followRepository.findOneAndUpdate(
                { userId: userObjectId, followingId: followingUserObjectId },
                { status: 'rejected' }
            );

            if (!response) return false;

            const socketId = userSocketMap.get(followingUserObjectId.toString());
            const userType = response.userType === 'candidate' ? "company" : "candidate";

            type ConnectedUser = IUser | IEmployeeProfile;
            let connectedUser: ConnectedUser | null;

            if (userType === 'candidate') {
                connectedUser = await this._userRepository.findById(payload.userId);
            } else {
                connectedUser = await this._profileRepository.findOne({ userId: payload.userId });
            }

            if (!connectedUser) return false;

            const content = userType === 'candidate'
                ? (connectedUser as IUser).name
                : (connectedUser as IEmployeeProfile).companyName;

            const attachments = userType === 'candidate'
                ? [(connectedUser as IUser).profile]
                : [
                    (connectedUser as IEmployeeProfile).logo,
                    (connectedUser as IEmployeeProfile).banner,
                ];

            const filteredAttachments = attachments.filter((a): a is string => typeof a === 'string');

            const notificationPayload = {
                recipientId: followingUserObjectId,
                senderId: userObjectId,
                content: `${content} rejected your follow request`,
                read: false,
                type: "follow-rejected" as NotificationType,
                attachments: filteredAttachments,
                createdAt: new Date(),
            };

            await this._notificationRepository.delete(notificationObjectId.toString());
            const filteredRejectedAttachments = notificationPayload.attachments.filter((a): a is string => typeof a === 'string');
            const notification = await this._notificationRepository.create({
                ...notificationPayload,
                attachments: filteredRejectedAttachments,
            });

            if (socketId && notification) {
                io.to(socketId).emit("notification", {
                    content: notification.content,
                    image: notification.attachments,
                    title: "Request Rejected",
                    senderId: userObjectId,
                });

                console.log(`Notification sent to user ${followingUserObjectId.toString()}`);
                return true;
            }

            return false;
        } catch (error) {
            console.error("Error in cancel():", error);
            return false;
        }
    }


    async unfollow(payload: FollowRequest): Promise<boolean | null> {
        try {
            const userObjectId = new Types.ObjectId(payload.userId);
            const followingUserObjectId = new Types.ObjectId(payload.followingId);
            const notificationObjectId = new Types.ObjectId(payload.notificationId);

            const response = await this._followRepository.findOneAndDelete(
                { userId: userObjectId, followingId: followingUserObjectId, status: 'accepted' });

            if (!response) return null;



            const userType = payload.userType
            const socketId = userSocketMap.get(payload.userId);
            let senderProfile: IUser | IEmployeeProfile | null

            if (userType === 'candidate') {
                senderProfile = await this._userRepository.findById(payload.followingId);
            } else {
                senderProfile = await this._profileRepository.findOne({ userId: payload.userId });
            }

            const content = userType === 'candidate'
                ? senderProfile?.name
                : senderProfile?.companyName;

            const attachments = userType === 'candidate'
                ? [senderProfile?.profile]
                : [senderProfile?.logo, senderProfile?.banner];

            const notificationPayload = {
                recipientId: userObjectId,
                senderId: followingUserObjectId,
                content: `${content} ${userType} has disconnected from you`,
                read: false,
                type: 'unfollow' as NotificationType,
                attachments,
                createdAt: new Date(),
            };

            const filteredAttachments = attachments.filter((a): a is string => typeof a === 'string');
            const notification = await this._notificationRepository.create({
                ...notificationPayload,
                attachments: filteredAttachments,
            });
            await this._notificationRepository.delete(notificationObjectId.toString())

            if (socketId && notification) {
                io.to(socketId).emit("notification", {
                    content: notification.content,
                    image: notification.attachments,
                    title: "Connection UnFollow",
                    senderId: userObjectId,
                });
                console.log(`Notification sent to user ${payload.followingId}`);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log(error);
            return false;
        }
    }


    private async sendFollowNotification(
        payload: FollowRequest,
        userObjectId: Types.ObjectId,
        followingUserObjectId: Types.ObjectId,
        userType: string
    ) {
        const socketId = userSocketMap.get(payload.followingId);
        let senderProfile: IUser | IEmployeeProfile | null

        if (userType === 'candidate') {
            senderProfile = await this._userRepository.findById(payload.userId);
        } else {
            senderProfile = await this._profileRepository.findOne({ userId: payload.userId });
        }

        const content = userType === 'candidate'
            ? senderProfile?.name
            : senderProfile?.companyName;

        const attachments = userType === 'candidate'
            ? [senderProfile?.profile]
            : [senderProfile?.logo, senderProfile?.banner];

        const filteredAttachments = attachments.filter((a): a is string => typeof a === 'string');

        const notificationPayload = {
            recipientId: followingUserObjectId,
            senderId: userObjectId,
            content: `${content} ${userType} wants to follow you`,
            read: false,
            type: 'follow' as NotificationType,
            attachments: filteredAttachments,
            createdAt: new Date(),
        };

        const notification = await this._notificationRepository.create(notificationPayload);

        if (socketId && notification) {
            io.to(socketId).emit("notification", {
                content: notification.content,
                image: notification.attachments,
                title: "New Follow Request",
                senderId: userObjectId,
            });

            console.log(`Notification sent to user ${payload.followingId}`);
        }
    }
}
