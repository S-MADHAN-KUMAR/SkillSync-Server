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
exports.FollowService = void 0;
const mongoose_1 = require("mongoose");
const __1 = require("../..");
class FollowService {
    constructor(_followRepository, _userRepository, _notificationRepository, _profileRepository) {
        this._followRepository = _followRepository;
        this._userRepository = _userRepository;
        this._notificationRepository = _notificationRepository;
        this._profileRepository = _profileRepository;
    }
    request(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const userObjectId = new mongoose_1.Types.ObjectId(payload.userId);
            const followingUserObjectId = new mongoose_1.Types.ObjectId(payload.followingId);
            const userType = payload.userType;
            const existingFollow = yield this._followRepository.findOne({
                userId: userObjectId,
                followingId: followingUserObjectId,
                userType
            });
            // If previously rejected, update to pending and send notification
            if ((existingFollow === null || existingFollow === void 0 ? void 0 : existingFollow.status) === 'rejected') {
                const updated = yield this._followRepository.findOneAndUpdate({ userId: userObjectId, followingId: followingUserObjectId, userType }, { status: 'pending' });
                if (!updated) {
                    console.log("Failed to update rejected connection");
                    return null;
                }
                yield this.sendFollowNotification(payload, userObjectId, followingUserObjectId, userType);
                return true;
            }
            // If already exists and not rejected, do nothing
            if (existingFollow)
                return false;
            // Create new follow record
            const newFollow = yield this._followRepository.create({
                userId: followingUserObjectId,
                followingId: userObjectId,
                status: 'pending',
                userType
            });
            if (!newFollow)
                return null;
            yield this.sendFollowNotification(payload, userObjectId, followingUserObjectId, userType);
            return true;
        });
    }
    accept(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userObjectId = new mongoose_1.Types.ObjectId(payload.userId);
                const followingUserObjectId = new mongoose_1.Types.ObjectId(payload.followingId);
                const notificationObjectId = new mongoose_1.Types.ObjectId(payload.notificationId);
                const response = yield this._followRepository.findOneAndUpdate({ userId: userObjectId, followingId: followingUserObjectId }, { status: 'accepted' });
                if (!response)
                    return null;
                const userType = response.userType === 'candidate' ? "company" : "candidate";
                const socketId = __1.userSocketMap.get(payload.followingId);
                let senderProfile;
                if (userType === 'candidate') {
                    senderProfile = yield this._userRepository.findById(payload.userId);
                }
                else {
                    senderProfile = yield this._profileRepository.findOne({ userId: payload.userId });
                }
                const content = userType === 'candidate'
                    ? senderProfile === null || senderProfile === void 0 ? void 0 : senderProfile.name
                    : senderProfile === null || senderProfile === void 0 ? void 0 : senderProfile.companyName;
                const attachments = userType === 'candidate'
                    ? [senderProfile === null || senderProfile === void 0 ? void 0 : senderProfile.profile]
                    : [senderProfile === null || senderProfile === void 0 ? void 0 : senderProfile.logo, senderProfile === null || senderProfile === void 0 ? void 0 : senderProfile.banner];
                const notificationPayload = {
                    recipientId: followingUserObjectId,
                    senderId: userObjectId,
                    content: `${content} ${userType} accepted your follow request`,
                    read: false,
                    type: 'message',
                    attachments,
                    createdAt: new Date(),
                };
                const notification = yield this._notificationRepository.create(notificationPayload);
                yield this._notificationRepository.delete(notificationObjectId.toString());
                if (socketId && notification) {
                    __1.io.to(socketId).emit("notification", {
                        content: notification.content,
                        image: notification.attachments,
                        title: "Request Accepted",
                        senderId: userObjectId,
                    });
                    console.log(`Notification sent to user ${payload.followingId}`);
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
    cancel(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userObjectId = new mongoose_1.Types.ObjectId(payload.userId);
                const followingUserObjectId = new mongoose_1.Types.ObjectId(payload.followingId);
                const notificationObjectId = new mongoose_1.Types.ObjectId(payload.notificationId);
                const response = yield this._followRepository.findOneAndUpdate({ $and: [{ userId: userObjectId }, { followingId: followingUserObjectId }] }, { status: 'rejected' });
                if (response) {
                    const socketId = __1.userSocketMap.get(followingUserObjectId.toString());
                    const userType = response.userType === 'candidate' ? "company" : "candidate";
                    let connectedUser;
                    if (userType === 'candidate') {
                        connectedUser = yield this._userRepository.findById(payload.userId);
                    }
                    else {
                        connectedUser = yield this._profileRepository.findOne({ userId: payload.userId });
                    }
                    const content = userType === 'candidate'
                        ? connectedUser === null || connectedUser === void 0 ? void 0 : connectedUser.name
                        : connectedUser === null || connectedUser === void 0 ? void 0 : connectedUser.companyName;
                    const attachments = userType === 'candidate'
                        ? [connectedUser === null || connectedUser === void 0 ? void 0 : connectedUser.profile]
                        : [connectedUser === null || connectedUser === void 0 ? void 0 : connectedUser.logo, connectedUser === null || connectedUser === void 0 ? void 0 : connectedUser.banner];
                    const notificationPayload = {
                        recipientId: new mongoose_1.Types.ObjectId(followingUserObjectId),
                        senderId: new mongoose_1.Types.ObjectId(userObjectId),
                        content: `${content} Rejected your Follow request`,
                        read: false,
                        type: "follow-rejected",
                        attachments,
                        createdAt: new Date(),
                    };
                    yield this._notificationRepository.delete(notificationObjectId.toString());
                    const notification = yield this._notificationRepository.create(notificationPayload);
                    if (socketId && notification) {
                        __1.io.to(socketId).emit("notification", {
                            content: notification.content,
                            image: notification.attachments,
                            title: "Request Rejected",
                            senderId: userObjectId,
                        });
                        console.log(`Notification sent to user ${followingUserObjectId.toString()}`);
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
    unfollow(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userObjectId = new mongoose_1.Types.ObjectId(payload.userId);
                const followingUserObjectId = new mongoose_1.Types.ObjectId(payload.followingId);
                const notificationObjectId = new mongoose_1.Types.ObjectId(payload.notificationId);
                const response = yield this._followRepository.findOneAndDelete({ userId: userObjectId, followingId: followingUserObjectId, status: 'accepted' });
                if (!response)
                    return null;
                const userType = payload.userType;
                const socketId = __1.userSocketMap.get(payload.userId);
                let senderProfile;
                if (userType === 'candidate') {
                    senderProfile = yield this._userRepository.findById(payload.followingId);
                }
                else {
                    senderProfile = yield this._profileRepository.findOne({ userId: payload.userId });
                }
                const content = userType === 'candidate'
                    ? senderProfile === null || senderProfile === void 0 ? void 0 : senderProfile.name
                    : senderProfile === null || senderProfile === void 0 ? void 0 : senderProfile.companyName;
                const attachments = userType === 'candidate'
                    ? [senderProfile === null || senderProfile === void 0 ? void 0 : senderProfile.profile]
                    : [senderProfile === null || senderProfile === void 0 ? void 0 : senderProfile.logo, senderProfile === null || senderProfile === void 0 ? void 0 : senderProfile.banner];
                const notificationPayload = {
                    recipientId: userObjectId,
                    senderId: followingUserObjectId,
                    content: `${content} ${userType} has disconnected from you`,
                    read: false,
                    type: 'unfollow',
                    attachments,
                    createdAt: new Date(),
                };
                const notification = yield this._notificationRepository.create(notificationPayload);
                yield this._notificationRepository.delete(notificationObjectId.toString());
                if (socketId && notification) {
                    __1.io.to(socketId).emit("notification", {
                        content: notification.content,
                        image: notification.attachments,
                        title: "Connection UnFollow",
                        senderId: userObjectId,
                    });
                    console.log(`Notification sent to user ${payload.followingId}`);
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
    sendFollowNotification(payload, userObjectId, followingUserObjectId, userType) {
        return __awaiter(this, void 0, void 0, function* () {
            const socketId = __1.userSocketMap.get(payload.followingId);
            let senderProfile;
            if (userType === 'candidate') {
                senderProfile = yield this._userRepository.findById(payload.userId);
            }
            else {
                senderProfile = yield this._profileRepository.findOne({ userId: payload.userId });
            }
            const content = userType === 'candidate'
                ? senderProfile === null || senderProfile === void 0 ? void 0 : senderProfile.name
                : senderProfile === null || senderProfile === void 0 ? void 0 : senderProfile.companyName;
            const attachments = userType === 'candidate'
                ? [senderProfile === null || senderProfile === void 0 ? void 0 : senderProfile.profile]
                : [senderProfile === null || senderProfile === void 0 ? void 0 : senderProfile.logo, senderProfile === null || senderProfile === void 0 ? void 0 : senderProfile.banner];
            const notificationPayload = {
                recipientId: followingUserObjectId,
                senderId: userObjectId,
                content: `${content} ${userType} wants to follow you`,
                read: false,
                type: 'follow',
                attachments,
                createdAt: new Date(),
            };
            const notification = yield this._notificationRepository.create(notificationPayload);
            if (socketId && notification) {
                __1.io.to(socketId).emit("notification", {
                    content: notification.content,
                    image: notification.attachments,
                    title: "New Follow Request",
                    senderId: userObjectId,
                });
                console.log(`Notification sent to user ${payload.followingId}`);
            }
        });
    }
}
exports.FollowService = FollowService;
