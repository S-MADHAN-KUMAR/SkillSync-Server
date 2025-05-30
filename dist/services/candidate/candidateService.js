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
exports.CandidateService = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("../../utils/constants");
const enums_1 = require("../../utils/enums");
const httpError_1 = require("../../utils/httpError");
const socket_1 = require("../../config/socket");
const __1 = require("../..");
class CandidateService {
    constructor(_candidateRepository, _userRepository, _connectionRepository, _savedJobsRepository, _jobPostRepository, _saveCandidateRepository, _applicationRepository, _messageRepository) {
        this._candidateRepository = _candidateRepository;
        this._userRepository = _userRepository;
        this._connectionRepository = _connectionRepository;
        this._savedJobsRepository = _savedJobsRepository;
        this._jobPostRepository = _jobPostRepository;
        this._saveCandidateRepository = _saveCandidateRepository;
        this._applicationRepository = _applicationRepository;
        this._messageRepository = _messageRepository;
    }
    updateOrCreate(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const userFound = yield this._userRepository.findOne({
                _id: id,
                role: 'candidate'
            });
            if (!userFound) {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
            const updatedPayload = Object.assign(Object.assign({}, payload), { userId: id, mobile: userFound === null || userFound === void 0 ? void 0 : userFound.mobile, email: userFound === null || userFound === void 0 ? void 0 : userFound.email });
            const candidateProfileExist = yield this._candidateRepository.findOne({ userId: id });
            let response;
            if (!candidateProfileExist) {
                const created = yield this._candidateRepository.create(updatedPayload);
                const updateUser = yield this._userRepository.update(id, { profile: updatedPayload === null || updatedPayload === void 0 ? void 0 : updatedPayload.logo, name: updatedPayload === null || updatedPayload === void 0 ? void 0 : updatedPayload.name });
                if (!created || !updateUser) {
                    throw new httpError_1.HttpError("Failed to create candidate profile", enums_1.StatusCode.INTERNAL_SERVER_ERROR);
                }
                response = created;
                const updatedUser = yield this._userRepository.update(id, { candidateProfileId: response._id });
                return { response, user: updatedUser };
            }
            else {
                const updated = yield this._candidateRepository.update(candidateProfileExist._id, updatedPayload);
                const updateUser = yield this._userRepository.update(id, { profile: updatedPayload === null || updatedPayload === void 0 ? void 0 : updatedPayload.logo, name: updatedPayload === null || updatedPayload === void 0 ? void 0 : updatedPayload.name });
                if (!updated || !updateUser) {
                    throw new httpError_1.HttpError("Failed to update candidate profile", enums_1.StatusCode.INTERNAL_SERVER_ERROR);
                }
                response = updated;
                return { response, user: userFound }; // already fetched user
            }
        });
    }
    getCandidateProfile(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._candidateRepository.findById(payload.id);
            if (!response) {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
            if (!payload.connectionId) {
                return response;
            }
            // Convert Mongoose document to plain object to safely add runtime-only fields
            const candidate = response.toObject();
            if (payload.connectionId) {
                const connection = yield this._connectionRepository.findOne({
                    userId: payload.connectionId,
                    connectedUserId: candidate.userId,
                });
                if (connection) {
                    candidate.isConnected = ['pending', 'accepted'].includes(connection.status);
                    candidate.connectionStatus = connection.status;
                }
            }
            return candidate;
        });
    }
    getAllCandidates(page, pageSize, querys, location, omit, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { candidates, totalCandidates } = yield this._candidateRepository.findAllCandidates(page, pageSize, querys, location, userId, omit);
            return { candidates, totalCandidates };
        });
    }
    saveJob(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {
                userId: new mongoose_1.Types.ObjectId(payload === null || payload === void 0 ? void 0 : payload.userId),
                jobId: new mongoose_1.Types.ObjectId(payload === null || payload === void 0 ? void 0 : payload.jobId)
            };
            const existing = yield this._savedJobsRepository.findOne({
                $and: [
                    { userId: data.userId },
                    { jobId: data.jobId },
                    { isDeleted: true }
                ]
            });
            if (existing) {
                if (existing.isDeleted) {
                    yield this._savedJobsRepository.update(existing._id, {
                        isDeleted: false,
                    });
                }
                return true; // ✅ Already existed, now restored
            }
            const response = yield this._savedJobsRepository.create(data);
            if (response) {
                return true;
            }
            else {
                throw new httpError_1.HttpError(constants_1.PostErrorMessages.POST_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    removeSaveJob(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._savedJobsRepository.update(id, { isDeleted: true });
            if (response) {
                return true;
            }
            else {
                throw new httpError_1.HttpError(constants_1.PostErrorMessages.POST_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    getAllSavedJobs(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const { page = 1, pageSize = 10, querys, id } = payload;
            const objectUserId = new mongoose_1.Types.ObjectId(id);
            const skip = (page - 1) * pageSize;
            const pipeline = [
                {
                    $match: {
                        userId: objectUserId,
                        isDeleted: false
                    }
                },
                {
                    $lookup: {
                        from: 'jobposts', // Ensure this is the actual name of your job posts collection
                        localField: 'jobId',
                        foreignField: '_id',
                        as: 'jobDetails'
                    }
                },
                { $unwind: '$jobDetails' },
                {
                    $match: Object.assign({ 'jobDetails.status': true }, ((querys === null || querys === void 0 ? void 0 : querys.trim()) && { 'jobDetails.jobTitle': { $regex: querys.trim(), $options: 'i' } }))
                },
                // Attach savedJobId to each job
                {
                    $addFields: {
                        'jobDetails.savedJobId': '$_id'
                    }
                },
                {
                    $facet: {
                        jobs: [
                            { $skip: skip },
                            { $limit: pageSize },
                            {
                                $replaceRoot: { newRoot: '$jobDetails' }
                            }
                        ],
                        totalCount: [
                            { $count: 'count' }
                        ]
                    }
                }
            ];
            const result = yield this._savedJobsRepository.aggregate(pipeline);
            const jobs = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.jobs) || [];
            const totalJobs = ((_c = (_b = result[0]) === null || _b === void 0 ? void 0 : _b.totalCount[0]) === null || _c === void 0 ? void 0 : _c.count) || 0;
            return { jobs, totalJobs };
        });
    }
    getStatistics(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalSavedJobs = yield this._savedJobsRepository.countDocuments({ userId: id });
            const totalApplications = yield this._applicationRepository.countDocuments({ candidateId: id });
            const totalSavedCandidates = yield this._connectionRepository.countDocuments({ userId: id, status: "accepted" });
            if (totalSavedJobs &&
                totalApplications &&
                totalSavedCandidates) {
                return {
                    totalSavedJobs,
                    totalApplications,
                    totalSavedCandidates
                };
            }
        });
    }
    getConnectedUsers(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const connections = yield this._connectionRepository.findAll({ userId: id });
            if (!(connections === null || connections === void 0 ? void 0 : connections.length))
                return null;
            const users = yield Promise.all(connections.map((c) => __awaiter(this, void 0, void 0, function* () {
                const candidateDoc = yield this._candidateRepository.findOne({ userId: c.connectedUserId });
                if (candidateDoc) {
                    // Convert to plain JS object to remove Mongoose internals
                    const candidate = candidateDoc.toObject();
                    const isOnline = socket_1.userSocketMap.has(c.connectedUserId.toString());
                    return { user: candidate, isOnline };
                }
                return null;
            })));
            return users.filter((u) => Boolean(u));
        });
    }
    messageTo(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { senderId, recipientId, content, imageUrls } = payload;
            const msg = yield this._messageRepository.create({
                senderId: new mongoose_1.Types.ObjectId(senderId),
                recipientId: new mongoose_1.Types.ObjectId(recipientId),
                content,
                attachments: (imageUrls === null || imageUrls === void 0 ? void 0 : imageUrls.length) ? imageUrls : [],
            });
            const senderUser = yield this._userRepository.findById(senderId);
            const socketId = socket_1.userSocketMap.get(recipientId);
            if (socketId) {
                __1.io.to(socketId).emit("message", {
                    content: msg.content,
                    profile: senderUser === null || senderUser === void 0 ? void 0 : senderUser.profile,
                    attachments: msg.attachments,
                    createdAt: msg.createdAt,
                    senderId: msg === null || msg === void 0 ? void 0 : msg.senderId,
                    _id: msg._id,
                    seen: (_a = msg.seen) !== null && _a !== void 0 ? _a : false
                });
            }
            return !!msg;
        });
    }
    getMessages(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { senderId, recipientId } = payload;
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const filter = {
                $or: [
                    {
                        senderId: new mongoose_1.Types.ObjectId(senderId),
                        recipientId: new mongoose_1.Types.ObjectId(recipientId),
                        isDeleted: false,
                        createdAt: { $gte: oneDayAgo },
                    },
                    {
                        senderId: new mongoose_1.Types.ObjectId(recipientId),
                        recipientId: new mongoose_1.Types.ObjectId(senderId),
                        createdAt: { $gte: oneDayAgo },
                        isDeleted: false
                    },
                ],
            };
            const messages = yield this._messageRepository.findAllSorted(filter, { createdAt: 1 });
            if (!(messages === null || messages === void 0 ? void 0 : messages.length))
                return { messages: null };
            return {
                messages: messages.map((msg) => msg.toObject()),
            };
        });
    }
    getUnSeenMessageCount(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield this._messageRepository.countDocuments({
                recipientId: new mongoose_1.Types.ObjectId(id),
                seen: false,
                isDeleted: false
            });
            if (count === null) {
                return { messages: null };
            }
            return { messages: count };
        });
    }
    removeMessage(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._messageRepository.update(id, { isDeleted: true });
            if (response) {
                const socketId = socket_1.userSocketMap.get(response === null || response === void 0 ? void 0 : response.recipientId.toString());
                if (socketId) {
                    __1.io.to(socketId).emit("message_updated", {
                        _id: id, // Include the ID
                        isDeleted: true,
                    });
                }
            }
            if (response) {
                return true;
            }
            else {
                throw new httpError_1.HttpError(constants_1.PostErrorMessages.POST_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    updateSeen(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const response = yield this._messageRepository.update(id, { seen: true });
            if (response) {
                const socketId = socket_1.userSocketMap.get(response === null || response === void 0 ? void 0 : response.senderId.toString());
                if (socketId) {
                    __1.io.to(socketId).emit("message_updated", {
                        content: response.content,
                        attachments: response.attachments,
                        createdAt: response.createdAt,
                        senderId: response === null || response === void 0 ? void 0 : response.senderId,
                        _id: response._id,
                        seen: (_a = response.seen) !== null && _a !== void 0 ? _a : false,
                        isDeleted: false,
                    });
                }
            }
            if (response) {
                return true;
            }
            else {
                throw new httpError_1.HttpError(constants_1.PostErrorMessages.POST_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    updateEditMessage(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const response = yield this._messageRepository.update(payload === null || payload === void 0 ? void 0 : payload.id, { content: payload === null || payload === void 0 ? void 0 : payload.content });
            if (response) {
                const socketId = socket_1.userSocketMap.get(response === null || response === void 0 ? void 0 : response.recipientId.toString());
                if (socketId) {
                    __1.io.to(socketId).emit("message_updated", {
                        content: response.content,
                        attachments: response.attachments,
                        createdAt: response.createdAt,
                        senderId: response === null || response === void 0 ? void 0 : response.senderId,
                        _id: response._id,
                        seen: (_a = response.seen) !== null && _a !== void 0 ? _a : false,
                        isDeleted: false,
                    });
                }
            }
            if (response) {
                return true;
            }
            else {
                throw new httpError_1.HttpError(constants_1.PostErrorMessages.POST_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
}
exports.CandidateService = CandidateService;
