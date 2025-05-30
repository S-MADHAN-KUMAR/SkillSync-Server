import { Types } from "mongoose";
import { IPost } from "../../interfaces/post/IPost";
import { IPostRepository } from "../../repositories/interface/IPostRepository";
import { IUserRepository } from "../../repositories/interface/IUserRepository";
import { PostErrorMessages, UserErrorMessages } from "../../utils/constants";
import { StatusCode } from "../../utils/enums";
import { HttpError } from "../../utils/httpError";
import { IPostService } from "../interface/IPostService";
import { ILikeRepository } from "../../repositories/interface/ILikeRepository";
import { userSocketMap } from "../../config/socket";
import { NotificationType } from "../../interfaces/INotification";
import { io } from "../..";
import { INotificationsRepository } from "../../repositories/interface/INotificationsRepository";
import { ICommentRepository } from "../../repositories/interface/ICommentRepository";
import { commentPayload, getRepliesPayload, replyCommentPayload } from "../../types/types";
import { IReplyRepository } from "../../repositories/interface/IReplyRepository";
import { IReply } from "../../interfaces/post/IReply";
import { ISavePostsRepository } from "../../repositories/interface/ISavePostsRepository";
import { ISavedPost } from "../../interfaces/post/ISavedPost";

export class PostService implements IPostService {
    private _postRepository: IPostRepository
    private _userRepository: IUserRepository
    private _notificationRepository: INotificationsRepository
    private _likeRepository: ILikeRepository
    private _commentRepository: ICommentRepository
    private _replyRepository: IReplyRepository
    private _savePostRepository: ISavePostsRepository

    constructor(_postRepository: IPostRepository, _userRepository: IUserRepository, _likeRepository: ILikeRepository, _notificationRepository: INotificationsRepository, _commentRepository: ICommentRepository, _replyRepository: IReplyRepository,
        _savePostRepository: ISavePostsRepository
    ) {
        this._postRepository = _postRepository;
        this._userRepository = _userRepository;
        this._likeRepository = _likeRepository;
        this._notificationRepository = _notificationRepository;
        this._commentRepository = _commentRepository;
        this._replyRepository = _replyRepository;
        this._savePostRepository = _savePostRepository;
    }

    async createPost(payload: Partial<IPost>, userId: string): Promise<{ response: IPost | null }> {
        console.log(payload);

        const userFound = await this._userRepository.findById(userId);

        if (!userFound) {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
        }

        if (userFound?.role !== payload?.role) {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
        }

        const updatedPayload = {
            ...payload,
            userId: userId
        };

        const response = await this._postRepository.create(updatedPayload);

        return { response };
    }

    async getRecentPosts(id: string): Promise<IPost[] | null> {
        const response = await this._postRepository.findRecentPosts(id)
        if (response) {
            return response
        } else {
            throw new HttpError(PostErrorMessages.POST_NOT_FOUND, StatusCode.NOT_FOUND)
        }
    }

    async getAllPosts(payload: { id: string, role: string }): Promise<IPost[] | null> {

        const response = await this._postRepository.findAllPosts(payload)
        if (response) {
            return response
        } else {
            throw new HttpError(PostErrorMessages.POST_NOT_FOUND, StatusCode.NOT_FOUND)
        }
    }

    async getUserPosts(page: number,
        pageSize: number,
        querys?: string, userId?: string): Promise<{ posts: IPost[]; totalPosts: number | null }> {

        const skip = (page - 1) * pageSize;
        const filter: any = {
            userId: userId,
            // isDeleted: false,
            status: true
        };

        if (querys) {
            filter.posterName = { $regex: querys, $options: 'i' };
        }

        const posts = await this._postRepository.findAll(filter, skip, pageSize);
        const totalPosts = await this._postRepository.countDocuments(filter);

        if (posts && posts.length > 0) {
            return { posts, totalPosts };
        } else {
            throw new HttpError(PostErrorMessages.POST_NOT_FOUND, StatusCode.NOT_FOUND);
        }
    }

    async getPost(id: string): Promise<IPost | null> {
        const response = await this._postRepository.findById(id)
        if (response) {
            return response
        } else {
            throw new HttpError(PostErrorMessages.POST_NOT_FOUND, StatusCode.NOT_FOUND)
        }
    }

    async updatePost(payload: IPost, id: string): Promise<IPost | null> {
        const response = await this._postRepository.update(id, payload)
        if (response) {
            return response
        } else {
            throw new HttpError(PostErrorMessages.POST_NOT_FOUND, StatusCode.NOT_FOUND)
        }
    }

    async toggleStatus(status: boolean, id: string): Promise<IPost | null> {
        const response = await this._postRepository.update(id, { isDeleted: status === true ? false : true })
        if (response) {
            return response
        } else {
            throw new HttpError(PostErrorMessages.POST_NOT_FOUND, StatusCode.NOT_FOUND)
        }
    }

    async togglePostStatus(status: boolean, id: string): Promise<IPost | null> {
        const response = await this._postRepository.update(id, { status: status === true ? false : true })
        if (response) {
            return response
        } else {
            throw new HttpError(PostErrorMessages.POST_NOT_FOUND, StatusCode.NOT_FOUND)
        }
    }

    async likePost(userId: string, postId: string): Promise<IPost | null> {
        const existingLike = await this._likeRepository.findOne({ userId, postId });
        let response: IPost | null = null;

        if (existingLike) {
            await this._likeRepository.findOneAndDelete({ userId, postId });
            response = await this._postRepository.increment(postId, { $inc: { likesCount: -1 } });
        } else {
            const payload = {
                userId: new Types.ObjectId(userId),
                postId: new Types.ObjectId(postId),
            };
            const created = await this._likeRepository.create(payload);

            if (created) {
                response = await this._postRepository.increment(postId, { $inc: { likesCount: 1 } });
            }

            const postUser = await this._postRepository.findById(postId);
            const recipientId = postUser?.userId?.toString() || null;
            const socketId = recipientId ? userSocketMap.get(recipientId) : null;

            const likedPersonId = created?.userId?.toString();
            const connectedUser = likedPersonId
                ? await this._userRepository.findById(likedPersonId)
                : null;

            if (connectedUser && connectedUser._id && recipientId) {
                const notificationPayload = {
                    recipientId: new Types.ObjectId(recipientId),
                    senderId: new Types.ObjectId(connectedUser._id.toString()), // ✅ Safe extraction
                    content: `${connectedUser.name} liked your post.`,
                    read: false,
                    type: "like" as NotificationType,
                    attachments: [connectedUser.profile as string],
                    createdAt: new Date(),
                };

                const notification = await this._notificationRepository.create(notificationPayload);

                if (socketId && notification) {
                    io.to(socketId).emit("notification", {
                        content: notification.content,
                        image: notification.attachments,
                        title: "New Like",
                        senderId: connectedUser._id,
                    });
                }
            }

            if (response) {
                return response;
            } else {
                throw new HttpError(PostErrorMessages.POST_NOT_FOUND, StatusCode.NOT_FOUND);
            }
        }

        return response;
    }

    async commentpost(userId: string, payload: commentPayload): Promise<IPost | null> {
        const commentData = {
            userId: new Types.ObjectId(userId),
            content: payload.content,
            postId: new Types.ObjectId(payload.postId),
        };

        const comment = await this._commentRepository.create(commentData);
        if (!comment) return null;

        const updatedPost = await this._postRepository.increment(payload.postId, {
            $inc: { commentsCount: 1 },
        });

        const postUser = await this._postRepository.findById(payload.postId);
        const recipientId = postUser?.userId?.toString() || null;
        const socketId = recipientId ? userSocketMap.get(recipientId) : null;

        const commentingUser = await this._userRepository.findById(userId);

        if (commentingUser && recipientId && commentingUser._id) {
            const notificationPayload = {
                recipientId: new Types.ObjectId(recipientId),
                senderId: new Types.ObjectId(commentingUser._id.toString()),
                content: `${commentingUser.name} commented on your post.`,
                read: false,
                type: "comment" as NotificationType,
                attachments: [commentingUser.profile as string],
                createdAt: new Date(),
            };

            const notification = await this._notificationRepository.create(notificationPayload);

            if (socketId && notification) {
                io.to(socketId).emit("notification", {
                    content: notification.content,
                    image: notification.attachments,
                    title: "New Comment",
                    senderId: commentingUser._id,
                });
            }
        }

        return updatedPost;
    }

    async replyComment(userId: string, payload: replyCommentPayload): Promise<boolean | null> {

        console.log(payload);

        const replyCommentData = {
            userId: new Types.ObjectId(userId),
            content: payload.content,
            commentId: new Types.ObjectId(payload.commentId),
            for: payload?.for
        };

        const replyComment = await this._replyRepository.create(replyCommentData);
        if (!replyComment) return null;


        const commentedUser = await this._commentRepository.findById(payload?.commentId as string);
        const recipientId = commentedUser?.userId?.toString() || null;
        const socketId = recipientId ? userSocketMap.get(recipientId) : null;

        const commentingUser = await this._userRepository.findById(userId);

        if (commentingUser && recipientId && commentingUser._id) {
            const notificationPayload = {
                recipientId: new Types.ObjectId(recipientId),
                senderId: new Types.ObjectId(commentingUser._id.toString()),
                content: `${commentingUser.name} replyed on your post.`,
                read: false,
                type: "reply" as NotificationType,
                attachments: [commentingUser.profile as string],
                createdAt: new Date(),
            };

            const notification = await this._notificationRepository.create(notificationPayload);

            if (socketId && notification) {
                io.to(socketId).emit("notification", {
                    content: notification.content,
                    image: notification.attachments,
                    title: "New Reply",
                    senderId: commentingUser._id,
                });
            }
        }

        return true;
    }

    async nestesReply(userId: string, payload: replyCommentPayload): Promise<boolean | null> {

        const replyCommentData = {
            userId: new Types.ObjectId(userId),
            content: payload.content,
            parentReplyId: new Types.ObjectId(payload.parentReplyId),
            for: payload?.for
        };

        const replyComment = await this._replyRepository.create(replyCommentData);
        if (!replyComment) return null;


        const commentedUser = await this._replyRepository.findById(payload?.parentReplyId as string);
        const recipientId = commentedUser?.userId?.toString() || null;
        const socketId = recipientId ? userSocketMap.get(recipientId) : null;

        const commentingUser = await this._userRepository.findById(userId);

        if (commentingUser && recipientId && commentingUser._id) {
            const notificationPayload = {
                recipientId: new Types.ObjectId(recipientId),
                senderId: new Types.ObjectId(commentingUser._id.toString()),
                content: `${commentingUser.name} replyed on your post.`,
                read: false,
                type: "reply" as NotificationType,
                attachments: [commentingUser.profile as string],
                createdAt: new Date(),
            };

            const notification = await this._notificationRepository.create(notificationPayload);

            if (socketId && notification) {
                io.to(socketId).emit("notification", {
                    content: notification.content,
                    image: notification.attachments,
                    title: "New Reply",
                    senderId: commentingUser._id,
                });
            }
        }

        return true;
    }

    async getReplies(payload: getRepliesPayload): Promise<IReply[] | null> {
        const response = await this._postRepository.getReplies(payload)
        if (response) {
            return response
        } else {
            throw new HttpError(PostErrorMessages.POST_NOT_FOUND, StatusCode.NOT_FOUND)
        }
    }

    async removeComment(id: string): Promise<boolean | null> {
        const comment = await this._commentRepository.findById(id);
        if (!comment) {
            throw new HttpError(PostErrorMessages.POST_NOT_FOUND, StatusCode.NOT_FOUND);
        }

        const deleted = await this._commentRepository.delete(id);
        if (deleted) {
            // 1. Decrease comment count on the post
            const post = await this._postRepository.findById(comment.postId.toString());
            if (post) {
                await this._postRepository.update(post?._id as string, {
                    commentsCount: Math.max(0, (post.commentsCount || 1) - 1)
                });
            }

            // 2. Delete replies to this comment
            const repliesToComment = await this._replyRepository.findAll({
                commentId: comment._id,
                for: "comment"
            });

            const replyIds = repliesToComment.map(r => r._id);

            if (replyIds.length > 0) {
                // 3. Delete nested replies to each reply
                await this._replyRepository.deleteMany({
                    parentReplyId: { $in: replyIds },
                    for: "reply"
                });
            }

            // 4. Delete replies to comment itself
            await this._replyRepository.deleteMany({
                commentId: comment._id,
                for: "comment"
            });

            return true;
        }

        return null;
    }

    async removeReply(id: string): Promise<boolean | null> {
        const response = await this._replyRepository.findOneAndDelete({ _id: id, for: "comment" })
        if (response) {
            return true
        } else {
            throw new HttpError(PostErrorMessages.POST_NOT_FOUND, StatusCode.NOT_FOUND)
        }
    }

    async removeNestedReply(id: string): Promise<boolean | null> {
        const response = await this._replyRepository.findOneAndDelete({ _id: id, for: "reply" })
        if (response) {
            return true
        } else {
            throw new HttpError(PostErrorMessages.POST_NOT_FOUND, StatusCode.NOT_FOUND)
        }
    }

    async getUserAllPosts(page: number,
        pageSize: number,
        id: string,
        userId: string,
        role: string
    ): Promise<{ posts: IPost[]; totalPosts: number | null }> {
        const { posts, totalPosts } = await this._postRepository.findUsersPosts({ id, userId, role, page, pageSize })
        if (posts && totalPosts) {
            return {
                posts, totalPosts
            }
        } else {
            throw new HttpError(PostErrorMessages.POST_NOT_FOUND, StatusCode.NOT_FOUND)
        }
    }

    async savePost(payload: {
        userId: string;
        userRole: string;
        postId: string;
    }): Promise<boolean> {
        const data = {
            userId: new Types.ObjectId(payload.userId),
            userRole: payload.userRole,
            postId: new Types.ObjectId(payload.postId),
        };

        const existing = await this._savePostRepository.findOne({
            userId: data.userId,
            postId: data.postId,
            userRole: data.userRole,
        });

        if (existing) {
            if (existing.isDeleted) {
                await this._savePostRepository.update(existing._id as string, {
                    isDeleted: false,
                });
            }
            return true; // ✅ Already existed, now restored
        }

        const response = await this._savePostRepository.create(data);
        if (response) {
            return true;
        }

        throw new HttpError(PostErrorMessages.POST_NOT_FOUND, StatusCode.NOT_FOUND);
    }

    async removeSavePost(id: string): Promise<boolean | null> {
        const response = await this._savePostRepository.update(id, { isDeleted: true })
        if (response) {
            return true
        } else {
            throw new HttpError(PostErrorMessages.POST_NOT_FOUND, StatusCode.NOT_FOUND)
        }
    }

    async getAllSavedPosts(page: number,
        pageSize: number,
        userId: string,
        querys: string,
        role: string
    ): Promise<{ posts: ISavedPost[]; totalPosts: number | null }> {
        const response = await this._postRepository.findAllSavedPosts({ id: userId, page, pageSize, role, querys })
        if (response) {
            return {
                posts: response.posts, totalPosts: response.totalPosts
            }
        } else {
            throw new HttpError(PostErrorMessages.POST_NOT_FOUND, StatusCode.NOT_FOUND)
        }
    }



}