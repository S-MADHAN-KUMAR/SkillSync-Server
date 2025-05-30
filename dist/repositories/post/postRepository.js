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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRepository = void 0;
const mongoose_1 = require("mongoose");
const post_1 = require("../../models/post/post");
const genericRepository_1 = require("../genericRepository");
const connectionModel_1 = require("../../models/connectionModel");
const followModel_1 = require("../../models/followModel");
const userModel_1 = __importDefault(require("../../models/userModel"));
const candidateProfileModel_1 = __importDefault(require("../../models/candidateProfileModel"));
const employeeProfileModel_1 = __importDefault(require("../../models/employeeProfileModel"));
const enums_1 = require("../../utils/enums");
const likes_1 = require("../../models/post/likes");
const comments_1 = require("../../models/post/comments");
const replys_1 = require("../../models/post/replys");
const savePost_1 = require("../../models/post/savePost");
class PostRepository extends genericRepository_1.GenericRepository {
    constructor() {
        super(post_1.PostModel);
    }
    findRecentPosts(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const posts = yield post_1.PostModel.aggregate([
                    {
                        $match: { userId: new mongoose_1.Types.ObjectId(userId), status: true }
                    },
                    {
                        $sort: { postedAt: -1 }
                    },
                    {
                        $limit: 10
                    },
                    // Lookup user
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'userId',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },
                    {
                        $unwind: {
                            path: '$user',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    // Lookup candidateProfile
                    {
                        $lookup: {
                            from: 'candidateprofiles',
                            let: { uid: '$userId', role: '$user.role' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $eq: ['$userId', '$$uid'] },
                                                { $eq: ['$$role', 'candidate'] }
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: 'candidateProfile'
                        }
                    },
                    {
                        $unwind: {
                            path: '$candidateProfile',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    // Lookup employeeProfile
                    {
                        $lookup: {
                            from: 'employeeprofiles',
                            let: { uid: '$userId', role: '$user.role' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $eq: ['$userId', '$$uid'] },
                                                { $eq: ['$$role', 'employee'] }
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: 'employeeProfile'
                        }
                    },
                    {
                        $unwind: {
                            path: '$employeeProfile',
                            preserveNullAndEmptyArrays: true
                        }
                    }
                ]);
                return posts;
            }
            catch (error) {
                console.error('Error fetching recent posts with profile:', error);
                throw new Error('Failed to fetch recent posts');
            }
        });
    }
    increment(id, incData) {
        return __awaiter(this, void 0, void 0, function* () {
            return post_1.PostModel.findByIdAndUpdate(id, incData, { new: true }).exec();
        });
    }
    findAllPosts(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const objectUserId = new mongoose_1.Types.ObjectId(payload.id);
                const prioritizedUserIds = new Set();
                if (payload.role === enums_1.Roles.CANDIDATE) {
                    const connections = yield connectionModel_1.ConnectionModel.find({
                        $or: [
                            { userId: objectUserId, status: "accepted" },
                            { connectedUserId: objectUserId, status: "accepted" },
                        ],
                    });
                    connections.forEach(conn => {
                        if (conn.userId.toString() !== payload.id) {
                            prioritizedUserIds.add(conn.userId.toString());
                        }
                        if (conn.connectedUserId.toString() !== payload.id) {
                            prioritizedUserIds.add(conn.connectedUserId.toString());
                        }
                    });
                    const follows = yield followModel_1.FollowModel.find({
                        followingId: objectUserId,
                        status: "accepted",
                    });
                    follows.forEach(f => prioritizedUserIds.add(f.userId.toString()));
                }
                if (payload.role === enums_1.Roles.EMPLOYEE) {
                    const users = yield userModel_1.default.find({ _id: { $ne: objectUserId } });
                    users.forEach(u => prioritizedUserIds.add(u === null || u === void 0 ? void 0 : u._id));
                }
                const prioritizedUserIdArray = Array.from(prioritizedUserIds).map(id => new mongoose_1.Types.ObjectId(id));
                const allPosts = yield post_1.PostModel.aggregate([
                    {
                        $match: {
                            isDeleted: false,
                            status: true,
                            userId: { $in: prioritizedUserIdArray }
                        }
                    },
                    {
                        $addFields: {
                            isPrioritized: {
                                $cond: [
                                    { $in: ["$userId", prioritizedUserIdArray] },
                                    1,
                                    0
                                ]
                            }
                        }
                    },
                    {
                        $sort: {
                            isPrioritized: -1,
                            createdAt: -1
                        }
                    }
                ]);
                const uniqueUserIds = [
                    ...new Set(allPosts.map(post => post.userId.toString()))
                ].map(id => new mongoose_1.Types.ObjectId(id));
                const [users, candidateProfiles, employeeProfiles] = yield Promise.all([
                    userModel_1.default.find({ _id: { $in: uniqueUserIds } }).lean(),
                    candidateProfileModel_1.default.find({ userId: { $in: uniqueUserIds } }).lean(),
                    employeeProfileModel_1.default.find({ userId: { $in: uniqueUserIds } }).lean(),
                ]);
                const userMap = new Map(users.map(user => [user._id.toString(), user]));
                const candidateMap = new Map(candidateProfiles.map(p => [p.userId.toString(), p]));
                const employeeMap = new Map(employeeProfiles.map(p => [p.userId.toString(), p]));
                const finalPosts = allPosts.map(post => {
                    const userIdStr = post.userId.toString();
                    const user = userMap.get(userIdStr);
                    const profile = (user === null || user === void 0 ? void 0 : user.role) === enums_1.Roles.CANDIDATE
                        ? candidateMap.get(userIdStr)
                        : employeeMap.get(userIdStr);
                    return Object.assign(Object.assign({}, post), { userInfo: user || null, userProfile: profile || null });
                });
                const postIds = finalPosts.map(post => post._id);
                const likedPosts = yield likes_1.LikeModel.find({
                    userId: objectUserId,
                    postId: { $in: postIds }
                }).lean();
                const likedPostIds = new Set(likedPosts.map(lp => lp.postId.toString()));
                const postsWithLikeInfo = finalPosts.map(post => (Object.assign(Object.assign({}, post), { isLiked: likedPostIds.has(post._id.toString()) })));
                // ✅ Fetch saved posts for the user and map them by postId
                const savedPosts = yield savePost_1.SavedPostModel.find({
                    userId: objectUserId,
                    postId: { $in: postIds },
                    userRole: payload === null || payload === void 0 ? void 0 : payload.role,
                    isDeleted: false
                }).lean();
                // ✅ Map for quick lookup
                const savedPostMap = new Map(savedPosts.map(saved => [saved.postId.toString(), saved._id.toString()]));
                // ✅ Attach isSaved and savedPostId correctly
                const postsWithSavedInfo = postsWithLikeInfo.map((post) => {
                    const postIdStr = post._id.toString();
                    return Object.assign(Object.assign({}, post), { isSaved: savedPostMap.has(postIdStr), savedPostId: savedPostMap.get(postIdStr) || null });
                });
                const allComments = yield comments_1.CommentModel.find({
                    postId: { $in: postIds }
                }).lean();
                const commentIds = allComments.map(c => c._id);
                const replies = yield replys_1.ReplyModel.aggregate([
                    { $match: { commentId: { $in: commentIds } } },
                    { $group: { _id: "$commentId", count: { $sum: 1 } } }
                ]);
                const repliesCountMap = new Map(replies.map(r => [r._id.toString(), r.count]));
                const commenterUserIds = [
                    ...new Set(allComments.map(c => c.userId.toString()))
                ].map(id => new mongoose_1.Types.ObjectId(id));
                const [commentUsers, commentCandidateProfiles, commentEmployeeProfiles] = yield Promise.all([
                    userModel_1.default.find({ _id: { $in: commenterUserIds } }).lean(),
                    candidateProfileModel_1.default.find({ userId: { $in: commenterUserIds } }).lean(),
                    employeeProfileModel_1.default.find({ userId: { $in: commenterUserIds } }).lean(),
                ]);
                const commentUserMap = new Map(commentUsers.map(u => [u._id.toString(), u]));
                const commentCandidateMap = new Map(commentCandidateProfiles.map(p => [p.userId.toString(), p]));
                const commentEmployeeMap = new Map(commentEmployeeProfiles.map(p => [p.userId.toString(), p]));
                const postsWithComments = postsWithSavedInfo.map((post) => {
                    const postIdStr = post._id.toString();
                    const postComments = allComments
                        .filter(comment => comment.postId.toString() === postIdStr &&
                        comment.userId.toString() !== payload.id)
                        .map(comment => {
                        const commenterId = comment.userId.toString();
                        const user = commentUserMap.get(commenterId);
                        const profile = (user === null || user === void 0 ? void 0 : user.role) === enums_1.Roles.CANDIDATE
                            ? commentCandidateMap.get(commenterId)
                            : commentEmployeeMap.get(commenterId);
                        return Object.assign(Object.assign({}, comment), { userInfo: user || null, userProfile: profile || null, totalReplies: repliesCountMap.get(comment._id.toString()) || 0 });
                    });
                    const userSpecificComment = allComments
                        .filter(comment => comment.postId.toString() === postIdStr &&
                        comment.userId.toString() === payload.id)
                        .map(comment => {
                        const commenterId = comment.userId.toString();
                        const user = commentUserMap.get(commenterId);
                        const profile = (user === null || user === void 0 ? void 0 : user.role) === enums_1.Roles.CANDIDATE
                            ? commentCandidateMap.get(commenterId)
                            : commentEmployeeMap.get(commenterId);
                        return Object.assign(Object.assign({}, comment), { userInfo: user || null, userProfile: profile || null, totalReplies: repliesCountMap.get(comment._id.toString()) || 0 });
                    });
                    return Object.assign(Object.assign({}, post), { comments: postComments, userSpecificComment });
                });
                return postsWithComments;
            }
            catch (error) {
                console.error("Error in findAllPosts:", error);
                return [];
            }
        });
    }
    getReplies(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let replies;
                if (payload.type === "reply") {
                    // Fetch all replies where for === "reply" and parentReplyId === parentId
                    replies = yield replys_1.ReplyModel.find({
                        parentReplyId: payload === null || payload === void 0 ? void 0 : payload.parentId,
                        for: "reply"
                    }).lean();
                }
                else {
                    // Original: fetch replies by commentId and type
                    replies = yield replys_1.ReplyModel.find({
                        commentId: payload === null || payload === void 0 ? void 0 : payload.parentId,
                        for: payload === null || payload === void 0 ? void 0 : payload.type
                    }).lean();
                }
                if (replies.length === 0)
                    return [];
                // 2. Get unique user IDs from replies
                const userIds = [
                    ...new Set(replies.map(reply => reply.userId.toString()))
                ].map(id => new mongoose_1.Types.ObjectId(id));
                // 3. Fetch user and profile data
                const [users, candidateProfiles, employeeProfiles] = yield Promise.all([
                    userModel_1.default.find({ _id: { $in: userIds } }).lean(),
                    candidateProfileModel_1.default.find({ userId: { $in: userIds } }).lean(),
                    employeeProfileModel_1.default.find({ userId: { $in: userIds } }).lean()
                ]);
                const userMap = new Map(users.map(user => [user._id.toString(), user]));
                const candidateMap = new Map(candidateProfiles.map(p => [p.userId.toString(), p]));
                const employeeMap = new Map(employeeProfiles.map(p => [p.userId.toString(), p]));
                // --- Fetch nested replies count for each reply ---
                const replyIds = replies.map(r => r._id);
                const nestedRepliesCounts = yield replys_1.ReplyModel.aggregate([
                    { $match: { parentReplyId: { $in: replyIds }, for: "reply" } },
                    { $group: { _id: "$parentReplyId", count: { $sum: 1 } } }
                ]);
                // Convert aggregation result into a map for quick lookup
                const nestedRepliesCountMap = new Map();
                nestedRepliesCounts.forEach(item => {
                    nestedRepliesCountMap.set(item._id.toString(), item.count);
                });
                // 4. Attach user, profile info, and nested replies count to replies
                const enrichedReplies = replies.map(reply => {
                    const userIdStr = reply.userId.toString();
                    const user = userMap.get(userIdStr);
                    const profile = (user === null || user === void 0 ? void 0 : user.role) === enums_1.Roles.CANDIDATE
                        ? candidateMap.get(userIdStr)
                        : employeeMap.get(userIdStr);
                    return Object.assign(Object.assign({}, reply), { userInfo: user || null, userProfile: profile || null, totalNestedReplies: nestedRepliesCountMap.get(reply._id.toString()) || 0 });
                });
                return enrichedReplies;
            }
            catch (error) {
                console.error("Error in getReplies:", error);
                return [];
            }
        });
    }
    findUsersPosts(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const profileOwnerId = new mongoose_1.Types.ObjectId(payload.id); // Profile being viewed
                const viewerId = new mongoose_1.Types.ObjectId(payload.userId); // Logged-in user
                const prioritizedUserIds = new Set();
                // 1. Collect connections and follows
                if (payload.role === enums_1.Roles.CANDIDATE) {
                    const connections = yield connectionModel_1.ConnectionModel.find({
                        $or: [
                            { userId: profileOwnerId, status: "accepted" },
                            { connectedUserId: profileOwnerId, status: "accepted" },
                        ],
                    });
                    connections.forEach(conn => {
                        if (conn.userId.toString() !== payload.id) {
                            prioritizedUserIds.add(conn.userId.toString());
                        }
                        if (conn.connectedUserId.toString() !== payload.id) {
                            prioritizedUserIds.add(conn.connectedUserId.toString());
                        }
                    });
                    const follows = yield followModel_1.FollowModel.find({
                        userId: profileOwnerId,
                        status: "accepted",
                    });
                    follows.forEach(f => prioritizedUserIds.add(f.followingId.toString()));
                }
                if (payload.role === enums_1.Roles.EMPLOYEE) {
                    const follows = yield followModel_1.FollowModel.find({
                        userId: profileOwnerId,
                        status: "accepted",
                        userType: "company",
                    });
                    follows.forEach(f => prioritizedUserIds.add(f.followingId.toString()));
                }
                const prioritizedUserIdArray = Array.from(prioritizedUserIds).map(id => new mongoose_1.Types.ObjectId(id));
                // 2. Fetch posts
                const postsAggregation = yield post_1.PostModel.aggregate([
                    {
                        $match: {
                            isDeleted: false,
                            status: true,
                            userId: profileOwnerId,
                        },
                    },
                    {
                        $addFields: {
                            isPrioritized: {
                                $cond: [{ $in: ["$userId", prioritizedUserIdArray] }, 1, 0],
                            },
                        },
                    },
                    {
                        $sort: {
                            isPrioritized: -1,
                            createdAt: -1,
                        },
                    },
                ]);
                const totalPosts = postsAggregation.length;
                // Pagination
                const page = payload.page || 1;
                const pageSize = payload.pageSize || 10;
                const paginatedPosts = postsAggregation.slice((page - 1) * pageSize, page * pageSize);
                const uniqueUserIds = [
                    ...new Set(paginatedPosts.map(post => post.userId.toString())),
                ].map(id => new mongoose_1.Types.ObjectId(id));
                const [users, candidateProfiles, employeeProfiles] = yield Promise.all([
                    userModel_1.default.find({ _id: { $in: uniqueUserIds } }).lean(),
                    candidateProfileModel_1.default.find({ userId: { $in: uniqueUserIds } }).lean(),
                    employeeProfileModel_1.default.find({ userId: { $in: uniqueUserIds } }).lean(),
                ]);
                const userMap = new Map(users.map(user => [user._id.toString(), user]));
                const candidateMap = new Map(candidateProfiles.map(p => [p.userId.toString(), p]));
                const employeeMap = new Map(employeeProfiles.map(p => [p.userId.toString(), p]));
                const finalPosts = paginatedPosts.map(post => {
                    const userIdStr = post.userId.toString();
                    const user = userMap.get(userIdStr);
                    const profile = (user === null || user === void 0 ? void 0 : user.role) === enums_1.Roles.CANDIDATE ? candidateMap.get(userIdStr) : employeeMap.get(userIdStr);
                    return Object.assign(Object.assign({}, post), { userInfo: user || null, userProfile: profile || null });
                });
                const postIds = finalPosts.map(post => post._id);
                // Likes by viewer
                const likedPosts = yield likes_1.LikeModel.find({
                    userId: viewerId,
                    postId: { $in: postIds },
                }).lean();
                const likedPostIds = new Set(likedPosts.map(lp => lp.postId.toString()));
                // Comments
                const allComments = yield comments_1.CommentModel.find({
                    postId: { $in: postIds },
                }).lean();
                const commentIds = allComments.map(c => c._id);
                const replies = yield replys_1.ReplyModel.aggregate([
                    { $match: { commentId: { $in: commentIds } } },
                    { $group: { _id: "$commentId", count: { $sum: 1 } } },
                ]);
                const repliesCountMap = new Map(replies.map(r => [r._id.toString(), r.count]));
                const commenterUserIds = [
                    ...new Set(allComments.map(c => c.userId.toString())),
                ].map(id => new mongoose_1.Types.ObjectId(id));
                const [commentUsers, commentCandidateProfiles, commentEmployeeProfiles] = yield Promise.all([
                    userModel_1.default.find({ _id: { $in: commenterUserIds } }).lean(),
                    candidateProfileModel_1.default.find({ userId: { $in: commenterUserIds } }).lean(),
                    employeeProfileModel_1.default.find({ userId: { $in: commenterUserIds } }).lean(),
                ]);
                const commentUserMap = new Map(commentUsers.map(u => [u._id.toString(), u]));
                const commentCandidateMap = new Map(commentCandidateProfiles.map(p => [p.userId.toString(), p]));
                const commentEmployeeMap = new Map(commentEmployeeProfiles.map(p => [p.userId.toString(), p]));
                const postsWithComments = finalPosts.map((post) => {
                    const postIdStr = post._id.toString();
                    const postComments = allComments
                        .filter(comment => comment.postId.toString() === postIdStr && comment.userId.toString() !== payload.userId)
                        .map(comment => {
                        const commenterId = comment.userId.toString();
                        const user = commentUserMap.get(commenterId);
                        const profile = (user === null || user === void 0 ? void 0 : user.role) === enums_1.Roles.CANDIDATE
                            ? commentCandidateMap.get(commenterId)
                            : commentEmployeeMap.get(commenterId);
                        return Object.assign(Object.assign({}, comment), { userInfo: user || null, userProfile: profile || null, totalReplies: repliesCountMap.get(comment._id.toString()) || 0 });
                    });
                    const userSpecificComment = allComments
                        .filter(comment => comment.postId.toString() === postIdStr && comment.userId.toString() === payload.userId)
                        .map(comment => {
                        const commenterId = comment.userId.toString();
                        const user = commentUserMap.get(commenterId);
                        const profile = (user === null || user === void 0 ? void 0 : user.role) === enums_1.Roles.CANDIDATE
                            ? commentCandidateMap.get(commenterId)
                            : commentEmployeeMap.get(commenterId);
                        return Object.assign(Object.assign({}, comment), { userInfo: user || null, userProfile: profile || null, totalReplies: repliesCountMap.get(comment._id.toString()) || 0 });
                    });
                    return Object.assign(Object.assign({}, post), { isLiked: likedPostIds.has(post._id.toString()), comments: postComments, userSpecificComment });
                });
                return {
                    totalPosts,
                    posts: postsWithComments,
                };
            }
            catch (error) {
                console.error("Error in findUsersPosts:", error);
                return {
                    totalPosts: 0,
                    posts: [],
                };
            }
        });
    }
    // async findAllSavedPosts(payload: {
    //     id: string;
    //     role: string;
    //     querys: string;
    //     page: number;
    //     pageSize: number;
    // }): Promise<{ posts: any[]; totalPosts: number }> {
    //     try {
    //         console.log(payload?.querys);
    //         const objectUserId = new Types.ObjectId(payload.id);
    //         // Step 1: Get saved posts by the user
    //         const savedPostsInitial = await SavedPostModel.find({
    //             userId: objectUserId,
    //             userRole: payload?.role,
    //             isDeleted: false
    //         }).lean();
    //         const savedPostIds = savedPostsInitial.map(sp => sp.postId);
    //         // Step 2: Count only saved posts
    //         const totalPosts = await PostModel.countDocuments({
    //             _id: { $in: savedPostIds },
    //             isDeleted: false,
    //             status: true,
    //             ...(payload.querys?.trim()
    //                 ?
    //                 { posterName: { $regex: payload.querys, $options: 'i' } }
    //                 : {})
    //         });
    //         // Step 3: Fetch saved posts with pagination
    //         const allPosts = await PostModel.aggregate([
    //             {
    //                 $match: {
    //                     _id: { $in: savedPostIds },
    //                     isDeleted: false,
    //                     status: true
    //                 }
    //             },
    //             { $sort: { createdAt: -1 } },
    //             { $skip: (payload.page - 1) * payload.pageSize },
    //             { $limit: payload.pageSize }
    //         ]);
    //         const uniqueUserIds = [
    //             ...new Set(allPosts.map(post => post.userId.toString()))
    //         ].map(id => new Types.ObjectId(id));
    //         const [users, candidateProfiles, employeeProfiles] = await Promise.all([
    //             userModel.find({ _id: { $in: uniqueUserIds } }).lean(),
    //             candidateProfileModel.find({ userId: { $in: uniqueUserIds } }).lean(),
    //             employeeProfileModel.find({ userId: { $in: uniqueUserIds } }).lean()
    //         ]);
    //         const userMap = new Map(users.map(user => [user._id.toString(), user]));
    //         const candidateMap = new Map(candidateProfiles.map(p => [p.userId.toString(), p]));
    //         const employeeMap = new Map(employeeProfiles.map(p => [p.userId.toString(), p]));
    //         const finalPosts = allPosts.map(post => {
    //             const userIdStr = post.userId.toString();
    //             const user = userMap.get(userIdStr);
    //             const profile =
    //                 user?.role === Roles.CANDIDATE
    //                     ? candidateMap.get(userIdStr)
    //                     : employeeMap.get(userIdStr);
    //             return {
    //                 ...post,
    //                 userInfo: user || null,
    //                 userProfile: profile || null
    //             };
    //         });
    //         const postIds = finalPosts.map(post => post._id);
    //         const likedPosts = await LikeModel.find({
    //             userId: objectUserId,
    //             postId: { $in: postIds }
    //         }).lean();
    //         const likedPostIds = new Set(likedPosts.map(lp => lp.postId.toString()));
    //         const postsWithLikeInfo = finalPosts.map(post => ({
    //             ...post,
    //             isLiked: likedPostIds.has(post._id.toString())
    //         }));
    //         const savedPostMap = new Map(
    //             savedPostsInitial.map(saved => [saved.postId.toString(), saved._id.toString()])
    //         );
    //         const postsWithSavedInfo = postsWithLikeInfo.map((post: any) => {
    //             const postIdStr = post._id.toString();
    //             return {
    //                 ...post,
    //                 isSaved: savedPostMap.has(postIdStr),
    //                 savedPostId: savedPostMap.get(postIdStr) || null
    //             };
    //         });
    //         const allComments = await CommentModel.find({
    //             postId: { $in: postIds }
    //         }).lean();
    //         const commentIds = allComments.map(c => c._id);
    //         const replies = await ReplyModel.aggregate([
    //             { $match: { commentId: { $in: commentIds } } },
    //             { $group: { _id: "$commentId", count: { $sum: 1 } } }
    //         ]);
    //         const repliesCountMap = new Map(replies.map(r => [r._id.toString(), r.count]));
    //         const commenterUserIds = [
    //             ...new Set(allComments.map(c => c.userId.toString()))
    //         ].map(id => new Types.ObjectId(id));
    //         const [commentUsers, commentCandidateProfiles, commentEmployeeProfiles] = await Promise.all([
    //             userModel.find({ _id: { $in: commenterUserIds } }).lean(),
    //             candidateProfileModel.find({ userId: { $in: commenterUserIds } }).lean(),
    //             employeeProfileModel.find({ userId: { $in: commenterUserIds } }).lean()
    //         ]);
    //         const commentUserMap = new Map(commentUsers.map(u => [u._id.toString(), u]));
    //         const commentCandidateMap = new Map(commentCandidateProfiles.map(p => [p.userId.toString(), p]));
    //         const commentEmployeeMap = new Map(commentEmployeeProfiles.map(p => [p.userId.toString(), p]));
    //         const postsWithComments = postsWithSavedInfo.map((post: any) => {
    //             const postIdStr = post._id.toString();
    //             const postComments = allComments
    //                 .filter(comment =>
    //                     comment.postId.toString() === postIdStr &&
    //                     comment.userId.toString() !== payload.id
    //                 )
    //                 .map(comment => {
    //                     const commenterId = comment.userId.toString();
    //                     const user = commentUserMap.get(commenterId);
    //                     const profile = user?.role === Roles.CANDIDATE
    //                         ? commentCandidateMap.get(commenterId)
    //                         : commentEmployeeMap.get(commenterId);
    //                     return {
    //                         ...comment,
    //                         userInfo: user || null,
    //                         userProfile: profile || null,
    //                         totalReplies: repliesCountMap.get(comment._id.toString()) || 0
    //                     };
    //                 });
    //             const userSpecificComment = allComments
    //                 .filter(comment =>
    //                     comment.postId.toString() === postIdStr &&
    //                     comment.userId.toString() === payload.id
    //                 )
    //                 .map(comment => {
    //                     const commenterId = comment.userId.toString();
    //                     const user = commentUserMap.get(commenterId);
    //                     const profile = user?.role === Roles.CANDIDATE
    //                         ? commentCandidateMap.get(commenterId)
    //                         : commentEmployeeMap.get(commenterId);
    //                     return {
    //                         ...comment,
    //                         userInfo: user || null,
    //                         userProfile: profile || null,
    //                         totalReplies: repliesCountMap.get(comment._id.toString()) || 0
    //                     };
    //                 });
    //             return {
    //                 ...post,
    //                 comments: postComments,
    //                 userSpecificComment
    //             };
    //         });
    //         return { posts: postsWithComments, totalPosts };
    //     } catch (error) {
    //         console.error("Error in findAllSavedPosts:", error);
    //         return { posts: [], totalPosts: 0 };
    //     }
    // }
    findAllSavedPosts(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                console.log("Search query:", payload === null || payload === void 0 ? void 0 : payload.querys);
                const objectUserId = new mongoose_1.Types.ObjectId(payload.id);
                const page = Math.max(1, payload.page || 1);
                const pageSize = Math.max(1, payload.pageSize || 10);
                // Step 1: Get saved posts by the user
                const savedPostsInitial = yield savePost_1.SavedPostModel.find({
                    userId: objectUserId,
                    userRole: payload === null || payload === void 0 ? void 0 : payload.role,
                    isDeleted: false
                }).lean();
                console.log("Saved posts found:", savedPostsInitial.length);
                const savedPostIds = savedPostsInitial.map(sp => typeof sp.postId === 'string' ? new mongoose_1.Types.ObjectId(sp.postId) : sp.postId);
                if (savedPostIds.length === 0) {
                    return { posts: [], totalPosts: 0 };
                }
                // Step 2: Build post match filter with optional search
                const postMatchQuery = {
                    _id: { $in: savedPostIds },
                    isDeleted: false,
                    status: true
                };
                if ((_a = payload.querys) === null || _a === void 0 ? void 0 : _a.trim()) {
                    postMatchQuery.posterName = { $regex: payload.querys.trim(), $options: 'i' };
                }
                const totalPosts = yield post_1.PostModel.countDocuments(postMatchQuery);
                // Step 3: Fetch posts with pagination
                const allPosts = yield post_1.PostModel.aggregate([
                    { $match: postMatchQuery },
                    { $sort: { createdAt: -1 } },
                    { $skip: (page - 1) * pageSize },
                    { $limit: pageSize }
                ]);
                const uniqueUserIds = [
                    ...new Set(allPosts.map(post => post.userId.toString()))
                ].map(id => new mongoose_1.Types.ObjectId(id));
                const [users, candidateProfiles, employeeProfiles] = yield Promise.all([
                    userModel_1.default.find({ _id: { $in: uniqueUserIds } }).lean(),
                    candidateProfileModel_1.default.find({ userId: { $in: uniqueUserIds } }).lean(),
                    employeeProfileModel_1.default.find({ userId: { $in: uniqueUserIds } }).lean()
                ]);
                const userMap = new Map(users.map(user => [user._id.toString(), user]));
                const candidateMap = new Map(candidateProfiles.map(p => [p.userId.toString(), p]));
                const employeeMap = new Map(employeeProfiles.map(p => [p.userId.toString(), p]));
                const finalPosts = allPosts.map(post => {
                    const userIdStr = post.userId.toString();
                    const user = userMap.get(userIdStr);
                    const profile = (user === null || user === void 0 ? void 0 : user.role) === enums_1.Roles.CANDIDATE
                        ? candidateMap.get(userIdStr)
                        : employeeMap.get(userIdStr);
                    return Object.assign(Object.assign({}, post), { userInfo: user || null, userProfile: profile || null });
                });
                const postIds = finalPosts.map(post => post._id);
                const likedPosts = yield likes_1.LikeModel.find({
                    userId: objectUserId,
                    postId: { $in: postIds }
                }).lean();
                const likedPostIds = new Set(likedPosts.map(lp => lp.postId.toString()));
                const postsWithLikeInfo = finalPosts.map(post => (Object.assign(Object.assign({}, post), { isLiked: likedPostIds.has(post._id.toString()) })));
                const savedPostMap = new Map(savedPostsInitial.map(saved => [saved.postId.toString(), saved._id.toString()]));
                const postsWithSavedInfo = postsWithLikeInfo.map((post) => {
                    const postIdStr = post._id.toString();
                    return Object.assign(Object.assign({}, post), { isSaved: savedPostMap.has(postIdStr), savedPostId: savedPostMap.get(postIdStr) || null });
                });
                const allComments = yield comments_1.CommentModel.find({
                    postId: { $in: postIds }
                }).lean();
                const commentIds = allComments.map(c => c._id);
                const replies = yield replys_1.ReplyModel.aggregate([
                    { $match: { commentId: { $in: commentIds } } },
                    { $group: { _id: "$commentId", count: { $sum: 1 } } }
                ]);
                const repliesCountMap = new Map(replies.map(r => [r._id.toString(), r.count]));
                const commenterUserIds = [
                    ...new Set(allComments.map(c => c.userId.toString()))
                ].map(id => new mongoose_1.Types.ObjectId(id));
                const [commentUsers, commentCandidateProfiles, commentEmployeeProfiles] = yield Promise.all([
                    userModel_1.default.find({ _id: { $in: commenterUserIds } }).lean(),
                    candidateProfileModel_1.default.find({ userId: { $in: commenterUserIds } }).lean(),
                    employeeProfileModel_1.default.find({ userId: { $in: commenterUserIds } }).lean()
                ]);
                const commentUserMap = new Map(commentUsers.map(u => [u._id.toString(), u]));
                const commentCandidateMap = new Map(commentCandidateProfiles.map(p => [p.userId.toString(), p]));
                const commentEmployeeMap = new Map(commentEmployeeProfiles.map(p => [p.userId.toString(), p]));
                const postsWithComments = postsWithSavedInfo.map((post) => {
                    const postIdStr = post._id.toString();
                    const postComments = allComments
                        .filter(comment => comment.postId.toString() === postIdStr &&
                        comment.userId.toString() !== payload.id)
                        .map(comment => {
                        const commenterId = comment.userId.toString();
                        const user = commentUserMap.get(commenterId);
                        const profile = (user === null || user === void 0 ? void 0 : user.role) === enums_1.Roles.CANDIDATE
                            ? commentCandidateMap.get(commenterId)
                            : commentEmployeeMap.get(commenterId);
                        return Object.assign(Object.assign({}, comment), { userInfo: user || null, userProfile: profile || null, totalReplies: repliesCountMap.get(comment._id.toString()) || 0 });
                    });
                    const userSpecificComment = allComments
                        .filter(comment => comment.postId.toString() === postIdStr &&
                        comment.userId.toString() === payload.id)
                        .map(comment => {
                        const commenterId = comment.userId.toString();
                        const user = commentUserMap.get(commenterId);
                        const profile = (user === null || user === void 0 ? void 0 : user.role) === enums_1.Roles.CANDIDATE
                            ? commentCandidateMap.get(commenterId)
                            : commentEmployeeMap.get(commenterId);
                        return Object.assign(Object.assign({}, comment), { userInfo: user || null, userProfile: profile || null, totalReplies: repliesCountMap.get(comment._id.toString()) || 0 });
                    });
                    return Object.assign(Object.assign({}, post), { comments: postComments, userSpecificComment });
                });
                return { posts: postsWithComments, totalPosts };
            }
            catch (error) {
                console.error("Error in findAllSavedPosts:", error);
                return { posts: [], totalPosts: 0 };
            }
        });
    }
}
exports.PostRepository = PostRepository;
