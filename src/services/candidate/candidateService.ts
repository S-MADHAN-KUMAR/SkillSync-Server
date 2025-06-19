import mongoose, { PipelineStage, Types } from "mongoose";
import { ICandidateProfile } from "../../interfaces/ICandidateProfile";
import { IUser } from "../../interfaces/IUser";
import candidateProfileModel from "../../models/candidateProfileModel";
import { ICandidateRepository } from "../../repositories/interface/ICandidateRepository";
import { IUserRepository } from "../../repositories/interface/IUserRepository";
import { PostErrorMessages, UserErrorMessages } from "../../utils/constants";
import { StatusCode } from "../../utils/enums";
import { HttpError } from "../../utils/httpError";
import { ICandidateService } from "../interface/ICandidateService";
import { IConnectionsRepository } from "../../repositories/interface/IConnectionsRepository";
import { ISaveJobsRepository } from "../../repositories/interface/ISaveJobsRepository";
import { ISavedJobs } from "../../interfaces/IISavedJobs";
import { IJobPostRepository } from "../../repositories/interface/IJobPostRepository";
import { IJobPost } from "../../interfaces/IJobPost";
import { ISaveCandidateRepository } from "../../repositories/interface/ISaveCandidateRepository";
import { IApplicationsRepository } from "../../repositories/interface/IApplicationsRepository";
import { userSocketMap } from "../../config/socket";
import { IMessageRepository } from "../../repositories/interface/IMessageRepository";
import { io } from "../..";

export class CandidateService implements ICandidateService {
    private _candidateRepository: ICandidateRepository;
    private _userRepository: IUserRepository;
    private _connectionRepository: IConnectionsRepository;
    private _savedJobsRepository: ISaveJobsRepository;
    private _jobPostRepository: IJobPostRepository;
    private _applicationRepository: IApplicationsRepository;
    private _saveCandidateRepository: ISaveCandidateRepository;
    private _messageRepository: IMessageRepository;

    constructor(
        _candidateRepository: ICandidateRepository,
        _userRepository: IUserRepository,
        _connectionRepository: IConnectionsRepository,
        _savedJobsRepository: ISaveJobsRepository,
        _jobPostRepository: IJobPostRepository,
        _saveCandidateRepository: ISaveCandidateRepository,
        _applicationRepository: IApplicationsRepository,
        _messageRepository: IMessageRepository
    ) {
        this._candidateRepository = _candidateRepository;
        this._userRepository = _userRepository;
        this._connectionRepository = _connectionRepository;
        this._savedJobsRepository = _savedJobsRepository;
        this._jobPostRepository = _jobPostRepository;
        this._saveCandidateRepository = _saveCandidateRepository;
        this._applicationRepository = _applicationRepository;
        this._messageRepository = _messageRepository;
    }

    async updateOrCreate(payload: Partial<ICandidateProfile>, id: string): Promise<{ response: ICandidateProfile; user: IUser | null }> {
        const userFound = await this._userRepository.findOne({
            _id: id,
            role: 'candidate'
        });

        if (!userFound) {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
        }

        const updatedPayload = {
            ...payload,
            userId: id,
            mobile: userFound?.mobile,
            email: userFound?.email,
        };

        const candidateProfileExist = await this._candidateRepository.findOne({ userId: id });

        let response: ICandidateProfile;

        if (!candidateProfileExist) {
            const created = await this._candidateRepository.create(updatedPayload);
            const updateUser = await this._userRepository.update(id, { profile: updatedPayload?.logo, name: updatedPayload?.name })
            if (!created || !updateUser) {
                throw new HttpError("Failed to create candidate profile", StatusCode.INTERNAL_SERVER_ERROR);
            }
            response = created;
            const updatedUser = await this._userRepository.update(id, { candidateProfileId: response._id });

            return { response, user: updatedUser };
        } else {
            const updated = await this._candidateRepository.update(candidateProfileExist._id as string, updatedPayload);
            const updateUser = await this._userRepository.update(id, { profile: updatedPayload?.logo, name: updatedPayload?.name })
            if (!updated || !updateUser) {
                throw new HttpError("Failed to update candidate profile", StatusCode.INTERNAL_SERVER_ERROR);
            }
            response = updated;

            return { response, user: userFound }; // already fetched user
        }
    }

    async getCandidateProfile(payload: { id: string; connectionId?: string }): Promise<ICandidateProfile & { isConnected?: boolean; connectionStatus?: string } | null> {
        const response = await this._candidateRepository.findById(payload.id);

        if (!response) {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
        }

        if (!payload.connectionId) {
            return response
        }


        // Convert Mongoose document to plain object to safely add runtime-only fields
        const candidate = response.toObject() as ICandidateProfile & {
            isConnected?: boolean;
            connectionStatus?: string;
        };

        if (payload.connectionId) {
            const connection = await this._connectionRepository.findOne({
                userId: payload.connectionId,
                connectedUserId: candidate.userId,
            });

            if (connection) {
                candidate.isConnected = ['pending', 'accepted'].includes(connection.status);
                candidate.connectionStatus = connection.status;
            }
        }

        return candidate;
    }

    async getAllCandidates(
        page: number,
        pageSize: number,
        querys?: string,
        location?: string,
        omit?: string,
        userId?: string
    ): Promise<{ candidates: ICandidateProfile[]; totalCandidates: number }> {

        const { candidates, totalCandidates } = await this._candidateRepository.findAllCandidates(page,
            pageSize,
            querys,
            location,
            userId,
            omit
        )

        return { candidates, totalCandidates }

    }

    async saveJob(payload: {
        userId: string,
        jobId: string
    }): Promise<boolean | null> {
        const data = {
            userId: new Types.ObjectId(payload?.userId),
            jobId: new Types.ObjectId(payload?.jobId)
        }
        const existing = await this._savedJobsRepository.findOne({
            $and: [
                { userId: data.userId },
                { jobId: data.jobId },
                { isDeleted: true }
            ]
        });

        if (existing) {
            if (existing.isDeleted) {
                await this._savedJobsRepository.update(existing._id as string, {
                    isDeleted: false,
                });
            }
            return true; // ✅ Already existed, now restored
        }
        const response = await this._savedJobsRepository.create(data)
        if (response) {
            return true
        } else {
            throw new HttpError(PostErrorMessages.POST_NOT_FOUND, StatusCode.NOT_FOUND)
        }
    }

    async removeSaveJob(id: string): Promise<boolean | null> {
        const response = await this._savedJobsRepository.update(id, { isDeleted: true })
        if (response) {
            return true
        } else {
            throw new HttpError(PostErrorMessages.POST_NOT_FOUND, StatusCode.NOT_FOUND)
        }
    }

    async getAllSavedJobs(payload: {
        page: number;
        pageSize: number;
        querys: string;
        id: string;
    }): Promise<{ jobs: IJobPost[]; totalJobs: number }> {
        const { page = 1, pageSize = 10, querys, id } = payload;
        const objectUserId = new Types.ObjectId(id);
        const skip = (page - 1) * pageSize;

        const pipeline: PipelineStage[] = [
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
                $match: {
                    'jobDetails.status': true,
                    ...(querys?.trim() && { 'jobDetails.jobTitle': { $regex: querys.trim(), $options: 'i' } })
                }
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

        const result = await this._savedJobsRepository.aggregate(pipeline);
        const jobs = result[0]?.jobs || [];
        const totalJobs = result[0]?.totalCount[0]?.count || 0;

        return { jobs, totalJobs };
    }



    async getStatistics(id: string): Promise<{
        totalJobs: number,
        savedPosts: number,
        savedCandidates: number
    } | null> {
        try {
            const totalJobs = await this._savedJobsRepository.countDocuments({ userId: id });
            const savedPosts = await this._applicationRepository.countDocuments({ candidateId: id });
            const savedCandidates = await this._connectionRepository.countDocuments({ userId: id, status: "accepted" });

            return {
                totalJobs,
                savedPosts,
                savedCandidates
            };
        } catch (error) {
            console.error("Failed to fetch statistics:", error);
            return null;
        }
    }

    async getConnectedUsers(id: string): Promise<{ user: ICandidateProfile; isOnline: boolean }[] | null> {
        const connections = await this._connectionRepository.findAll({ userId: id });

        if (!connections?.length) return null;

        const users = await Promise.all(
            connections.map(async (c) => {
                const candidateDoc = await this._candidateRepository.findOne({ userId: c.connectedUserId });
                if (candidateDoc) {
                    // Convert to plain JS object to remove Mongoose internals
                    const candidate = candidateDoc.toObject();
                    const isOnline = userSocketMap.has(c.connectedUserId.toString());
                    return { user: candidate, isOnline };
                }
                return null;
            })
        );

        return users.filter(
            (u): u is { user: ICandidateProfile; isOnline: boolean } => Boolean(u)
        );
    }

    async messageTo(payload: {
        senderId: string;
        recipientId: string;
        content: string;
        imageUrls?: string[];
    }): Promise<boolean> {
        const { senderId, recipientId, content, imageUrls } = payload;

        const msg = await this._messageRepository.create({
            senderId: new Types.ObjectId(senderId),
            recipientId: new Types.ObjectId(recipientId),
            content,
            attachments: imageUrls?.length ? imageUrls : [],
        });

        const senderUser = await this._userRepository.findById(senderId);
        const socketId = userSocketMap.get(recipientId);

        if (socketId) {
            io.to(socketId).emit("message", {
                content: msg.content,
                profile: senderUser?.profile,
                attachments: msg.attachments,
                createdAt: msg.createdAt,
                senderId: msg?.senderId,
                _id: msg._id,
                seen: msg.seen ?? false
            });
        }

        return !!msg;
    }

    async getMessages(payload: {
        senderId: string;
        recipientId: string;
    }): Promise<{ messages: any[] | null }> {
        const { senderId, recipientId } = payload;

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const filter = {
            $or: [
                {
                    senderId: new Types.ObjectId(senderId),
                    recipientId: new Types.ObjectId(recipientId),
                    isDeleted: false,
                    createdAt: { $gte: oneDayAgo },
                },
                {
                    senderId: new Types.ObjectId(recipientId),
                    recipientId: new Types.ObjectId(senderId),
                    createdAt: { $gte: oneDayAgo },
                    isDeleted: false
                },
            ],
        };

        const messages = await this._messageRepository.findAllSorted(filter, { createdAt: 1 });

        if (!messages?.length) return { messages: null };

        return {
            messages: messages.map((msg) => msg.toObject()),
        };
    }

    async getUnSeenMessageCount(id: string): Promise<{ messages: number | null }> {

        const count = await this._messageRepository.countDocuments({
            recipientId: new Types.ObjectId(id),
            seen: false,
            isDeleted: false
        });

        if (count === null) {
            return { messages: null };
        }

        return { messages: count };
    }

    async removeMessage(id: string): Promise<boolean | null> {
        const response = await this._messageRepository.update(id, { isDeleted: true });
        if (response) {

            const socketId = userSocketMap.get(response?.recipientId.toString())

            if (socketId) {
                io.to(socketId).emit("message_updated", {
                    _id: id, // Include the ID
                    isDeleted: true,
                });
            }
        }

        if (response) {
            return true;
        } else {
            throw new HttpError(PostErrorMessages.POST_NOT_FOUND, StatusCode.NOT_FOUND);
        }
    }

    async updateSeen(id: string): Promise<boolean | null> {
        const response = await this._messageRepository.update(id, { seen: true });
        if (response) {
            const socketId = userSocketMap.get(response?.senderId.toString())

            if (socketId) {
                io.to(socketId).emit("message_updated", {
                    content: response.content,
                    attachments: response.attachments,
                    createdAt: response.createdAt,
                    senderId: response?.senderId,
                    _id: response._id,
                    seen: response.seen ?? false,
                    isDeleted: false,
                });
            }
        }
        if (response) {
            return true;
        } else {
            throw new HttpError(PostErrorMessages.POST_NOT_FOUND, StatusCode.NOT_FOUND);
        }
    }

    async updateEditMessage(payload: { id: string, content: string }): Promise<boolean | null> {
        const response = await this._messageRepository.update(payload?.id, { content: payload?.content });
        if (response) {
            const socketId = userSocketMap.get(response?.recipientId.toString())

            if (socketId) {
                io.to(socketId).emit("message_updated", {
                    content: response.content,
                    attachments: response.attachments,
                    createdAt: response.createdAt,
                    senderId: response?.senderId,
                    _id: response._id,
                    seen: response.seen ?? false,
                    isDeleted: false,
                });
            }
        }
        if (response) {
            return true;
        } else {
            throw new HttpError(PostErrorMessages.POST_NOT_FOUND, StatusCode.NOT_FOUND);
        }
    }

}