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
exports.PostService = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("../../utils/constants");
const enums_1 = require("../../utils/enums");
const httpError_1 = require("../../utils/httpError");
const socket_1 = require("../../config/socket");
const __1 = require("../..");
class PostService {
    constructor(_postRepository, _userRepository, _likeRepository, _notificationRepository, _commentRepository, _replyRepository, _savePostRepository) {
        this._postRepository = _postRepository;
        this._userRepository = _userRepository;
        this._likeRepository = _likeRepository;
        this._notificationRepository = _notificationRepository;
        this._commentRepository = _commentRepository;
        this._replyRepository = _replyRepository;
        this._savePostRepository = _savePostRepository;
    }
    createPost(payload, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(payload);
            const userFound = yield this._userRepository.findById(userId);
            if (!userFound) {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
            if ((userFound === null || userFound === void 0 ? void 0 : userFound.role) !== (payload === null || payload === void 0 ? void 0 : payload.role)) {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
            const updatedPayload = Object.assign(Object.assign({}, payload), { userId: userId });
            const response = yield this._postRepository.create(updatedPayload);
            return { response };
        });
    }
    getRecentPosts(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._postRepository.findRecentPosts(id);
            if (response) {
                return response;
            }
            else {
                throw new httpError_1.HttpError(constants_1.PostErrorMessages.POST_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    getAllPosts(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._postRepository.findAllPosts(payload);
            if (response) {
                return response;
            }
            else {
                throw new httpError_1.HttpError(constants_1.PostErrorMessages.POST_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    getUserPosts(page, pageSize, querys, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * pageSize;
            const filter = {
                userId: userId,
                // isDeleted: false,
                status: true
            };
            if (querys) {
                filter.posterName = { $regex: querys, $options: 'i' };
            }
            const posts = yield this._postRepository.findAll(filter, skip, pageSize);
            const totalPosts = yield this._postRepository.countDocuments(filter);
            if (posts && posts.length > 0) {
                return { posts, totalPosts };
            }
            else {
                throw new httpError_1.HttpError(constants_1.PostErrorMessages.POST_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    getPost(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._postRepository.findById(id);
            if (response) {
                return response;
            }
            else {
                throw new httpError_1.HttpError(constants_1.PostErrorMessages.POST_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    updatePost(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._postRepository.update(id, payload);
            if (response) {
                return response;
            }
            else {
                throw new httpError_1.HttpError(constants_1.PostErrorMessages.POST_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    toggleStatus(status, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._postRepository.update(id, { isDeleted: status === true ? false : true });
            if (response) {
                return response;
            }
            else {
                throw new httpError_1.HttpError(constants_1.PostErrorMessages.POST_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    togglePostStatus(status, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._postRepository.update(id, { status: status === true ? false : true });
            if (response) {
                return response;
            }
            else {
                throw new httpError_1.HttpError(constants_1.PostErrorMessages.POST_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    likePost(userId, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const existingLike = yield this._likeRepository.findOne({ userId, postId });
            let response = null;
            if (existingLike) {
                yield this._likeRepository.findOneAndDelete({ userId, postId });
                response = yield this._postRepository.increment(postId, { $inc: { likesCount: -1 } });
            }
            else {
                const payload = {
                    userId: new mongoose_1.Types.ObjectId(userId),
                    postId: new mongoose_1.Types.ObjectId(postId),
                };
                const created = yield this._likeRepository.create(payload);
                if (created) {
                    response = yield this._postRepository.increment(postId, { $inc: { likesCount: 1 } });
                }
                const postUser = yield this._postRepository.findById(postId);
                const recipientId = ((_a = postUser === null || postUser === void 0 ? void 0 : postUser.userId) === null || _a === void 0 ? void 0 : _a.toString()) || null;
                const socketId = recipientId ? socket_1.userSocketMap.get(recipientId) : null;
                const likedPersonId = (_b = created === null || created === void 0 ? void 0 : created.userId) === null || _b === void 0 ? void 0 : _b.toString();
                const connectedUser = likedPersonId
                    ? yield this._userRepository.findById(likedPersonId)
                    : null;
                if (connectedUser && connectedUser._id && recipientId) {
                    const notificationPayload = {
                        recipientId: new mongoose_1.Types.ObjectId(recipientId),
                        senderId: new mongoose_1.Types.ObjectId(connectedUser._id.toString()), // ✅ Safe extraction
                        content: `${connectedUser.name} liked your post.`,
                        read: false,
                        type: "like",
                        attachments: [connectedUser.profile],
                        createdAt: new Date(),
                    };
                    const notification = yield this._notificationRepository.create(notificationPayload);
                    if (socketId && notification) {
                        __1.io.to(socketId).emit("notification", {
                            content: notification.content,
                            image: notification.attachments,
                            title: "New Like",
                            senderId: connectedUser._id,
                        });
                    }
                }
                if (response) {
                    return response;
                }
                else {
                    throw new httpError_1.HttpError(constants_1.PostErrorMessages.POST_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
                }
            }
            return response;
        });
    }
    commentpost(userId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const commentData = {
                userId: new mongoose_1.Types.ObjectId(userId),
                content: payload.content,
                postId: new mongoose_1.Types.ObjectId(payload.postId),
            };
            const comment = yield this._commentRepository.create(commentData);
            if (!comment)
                return null;
            const updatedPost = yield this._postRepository.increment(payload.postId, {
                $inc: { commentsCount: 1 },
            });
            const postUser = yield this._postRepository.findById(payload.postId);
            const recipientId = ((_a = postUser === null || postUser === void 0 ? void 0 : postUser.userId) === null || _a === void 0 ? void 0 : _a.toString()) || null;
            const socketId = recipientId ? socket_1.userSocketMap.get(recipientId) : null;
            const commentingUser = yield this._userRepository.findById(userId);
            if (commentingUser && recipientId && commentingUser._id) {
                const notificationPayload = {
                    recipientId: new mongoose_1.Types.ObjectId(recipientId),
                    senderId: new mongoose_1.Types.ObjectId(commentingUser._id.toString()),
                    content: `${commentingUser.name} commented on your post.`,
                    read: false,
                    type: "comment",
                    attachments: [commentingUser.profile],
                    createdAt: new Date(),
                };
                const notification = yield this._notificationRepository.create(notificationPayload);
                if (socketId && notification) {
                    __1.io.to(socketId).emit("notification", {
                        content: notification.content,
                        image: notification.attachments,
                        title: "New Comment",
                        senderId: commentingUser._id,
                    });
                }
            }
            return updatedPost;
        });
    }
    replyComment(userId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            console.log(payload);
            const replyCommentData = {
                userId: new mongoose_1.Types.ObjectId(userId),
                content: payload.content,
                commentId: new mongoose_1.Types.ObjectId(payload.commentId),
                for: payload === null || payload === void 0 ? void 0 : payload.for
            };
            const replyComment = yield this._replyRepository.create(replyCommentData);
            if (!replyComment)
                return null;
            const commentedUser = yield this._commentRepository.findById(payload === null || payload === void 0 ? void 0 : payload.commentId);
            const recipientId = ((_a = commentedUser === null || commentedUser === void 0 ? void 0 : commentedUser.userId) === null || _a === void 0 ? void 0 : _a.toString()) || null;
            const socketId = recipientId ? socket_1.userSocketMap.get(recipientId) : null;
            const commentingUser = yield this._userRepository.findById(userId);
            if (commentingUser && recipientId && commentingUser._id) {
                const notificationPayload = {
                    recipientId: new mongoose_1.Types.ObjectId(recipientId),
                    senderId: new mongoose_1.Types.ObjectId(commentingUser._id.toString()),
                    content: `${commentingUser.name} replyed on your post.`,
                    read: false,
                    type: "reply",
                    attachments: [commentingUser.profile],
                    createdAt: new Date(),
                };
                const notification = yield this._notificationRepository.create(notificationPayload);
                if (socketId && notification) {
                    __1.io.to(socketId).emit("notification", {
                        content: notification.content,
                        image: notification.attachments,
                        title: "New Reply",
                        senderId: commentingUser._id,
                    });
                }
            }
            return true;
        });
    }
    nestesReply(userId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const replyCommentData = {
                userId: new mongoose_1.Types.ObjectId(userId),
                content: payload.content,
                parentReplyId: new mongoose_1.Types.ObjectId(payload.parentReplyId),
                for: payload === null || payload === void 0 ? void 0 : payload.for
            };
            const replyComment = yield this._replyRepository.create(replyCommentData);
            if (!replyComment)
                return null;
            const commentedUser = yield this._replyRepository.findById(payload === null || payload === void 0 ? void 0 : payload.parentReplyId);
            const recipientId = ((_a = commentedUser === null || commentedUser === void 0 ? void 0 : commentedUser.userId) === null || _a === void 0 ? void 0 : _a.toString()) || null;
            const socketId = recipientId ? socket_1.userSocketMap.get(recipientId) : null;
            const commentingUser = yield this._userRepository.findById(userId);
            if (commentingUser && recipientId && commentingUser._id) {
                const notificationPayload = {
                    recipientId: new mongoose_1.Types.ObjectId(recipientId),
                    senderId: new mongoose_1.Types.ObjectId(commentingUser._id.toString()),
                    content: `${commentingUser.name} replyed on your post.`,
                    read: false,
                    type: "reply",
                    attachments: [commentingUser.profile],
                    createdAt: new Date(),
                };
                const notification = yield this._notificationRepository.create(notificationPayload);
                if (socketId && notification) {
                    __1.io.to(socketId).emit("notification", {
                        content: notification.content,
                        image: notification.attachments,
                        title: "New Reply",
                        senderId: commentingUser._id,
                    });
                }
            }
            return true;
        });
    }
    getReplies(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._postRepository.getReplies(payload);
            if (response) {
                return response;
            }
            else {
                throw new httpError_1.HttpError(constants_1.PostErrorMessages.POST_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    removeComment(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const comment = yield this._commentRepository.findById(id);
            if (!comment) {
                throw new httpError_1.HttpError(constants_1.PostErrorMessages.POST_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
            const deleted = yield this._commentRepository.delete(id);
            if (deleted) {
                // 1. Decrease comment count on the post
                const post = yield this._postRepository.findById(comment.postId.toString());
                if (post) {
                    yield this._postRepository.update(post === null || post === void 0 ? void 0 : post._id, {
                        commentsCount: Math.max(0, (post.commentsCount || 1) - 1)
                    });
                }
                // 2. Delete replies to this comment
                const repliesToComment = yield this._replyRepository.findAll({
                    commentId: comment._id,
                    for: "comment"
                });
                const replyIds = repliesToComment.map(r => r._id);
                if (replyIds.length > 0) {
                    // 3. Delete nested replies to each reply
                    yield this._replyRepository.deleteMany({
                        parentReplyId: { $in: replyIds },
                        for: "reply"
                    });
                }
                // 4. Delete replies to comment itself
                yield this._replyRepository.deleteMany({
                    commentId: comment._id,
                    for: "comment"
                });
                return true;
            }
            return null;
        });
    }
    removeReply(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._replyRepository.findOneAndDelete({ _id: id, for: "comment" });
            if (response) {
                return true;
            }
            else {
                throw new httpError_1.HttpError(constants_1.PostErrorMessages.POST_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    removeNestedReply(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._replyRepository.findOneAndDelete({ _id: id, for: "reply" });
            if (response) {
                return true;
            }
            else {
                throw new httpError_1.HttpError(constants_1.PostErrorMessages.POST_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    getUserAllPosts(page, pageSize, id, userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const { posts, totalPosts } = yield this._postRepository.findUsersPosts({ id, userId, role, page, pageSize });
            if (posts && totalPosts) {
                return {
                    posts, totalPosts
                };
            }
            else {
                throw new httpError_1.HttpError(constants_1.PostErrorMessages.POST_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    savePost(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {
                userId: new mongoose_1.Types.ObjectId(payload.userId),
                userRole: payload.userRole,
                postId: new mongoose_1.Types.ObjectId(payload.postId),
            };
            const existing = yield this._savePostRepository.findOne({
                userId: data.userId,
                postId: data.postId,
                userRole: data.userRole,
            });
            if (existing) {
                if (existing.isDeleted) {
                    yield this._savePostRepository.update(existing._id, {
                        isDeleted: false,
                    });
                }
                return true; // ✅ Already existed, now restored
            }
            const response = yield this._savePostRepository.create(data);
            if (response) {
                return true;
            }
            throw new httpError_1.HttpError(constants_1.PostErrorMessages.POST_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
        });
    }
    removeSavePost(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._savePostRepository.update(id, { isDeleted: true });
            if (response) {
                return true;
            }
            else {
                throw new httpError_1.HttpError(constants_1.PostErrorMessages.POST_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    getAllSavedPosts(page, pageSize, userId, querys, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._postRepository.findAllSavedPosts({ id: userId, page, pageSize, role, querys });
            if (response) {
                return {
                    posts: response.posts, totalPosts: response.totalPosts
                };
            }
            else {
                throw new httpError_1.HttpError(constants_1.PostErrorMessages.POST_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
}
exports.PostService = PostService;
