import mongoose, { Types, UpdateQuery } from "mongoose";
import { IPost } from "../../interfaces/post/IPost";
import { PostModel } from "../../models/post/post";
import { GenericRepository } from "../genericRepository";
import { IPostRepository } from "../interface/IPostRepository";
import { ConnectionModel } from "../../models/connectionModel";
import { FollowModel } from "../../models/followModel";
import userModel from "../../models/userModel";
import candidateProfileModel from "../../models/candidateProfileModel";
import employeeProfileModel from "../../models/employeeProfileModel";
import { Roles } from "../../utils/enums";
import { LikeModel } from "../../models/post/likes";
import { CommentModel } from "../../models/post/comments";
import { ReplyModel } from "../../models/post/replys";
import { getRepliesPayload } from "../../types/types";
import { savedJobsModel } from "../../models/saveJobsModel";
import { SavedPostModel } from "../../models/post/savePost";
import { IUser } from "../../interfaces/IUser";
import { IReply } from "../../interfaces/post/IReply";

export class PostRepository
    extends GenericRepository<IPost>
    implements IPostRepository {
    constructor() {
        super(PostModel);
    }

    async findRecentPosts(userId: string): Promise<IPost[]> {
        try {
            const posts = await PostModel.aggregate([
                {
                    $match: { userId: new Types.ObjectId(userId), status: true }
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
        } catch (error) {
            console.error('Error fetching recent posts with profile:', error);
            throw new Error('Failed to fetch recent posts');
        }
    }

    async increment(id: string, incData: UpdateQuery<IPost>): Promise<IPost | null> {
        return PostModel.findByIdAndUpdate(id, incData, { new: true }).exec();
    }

    async findAllPosts(payload: { id: string; role: string }): Promise<IPost[]> {
        try {
            const objectUserId = new Types.ObjectId(payload.id);
            const prioritizedUserIds = new Set<string>();

            if (payload.role === Roles.CANDIDATE) {
                const connections = await ConnectionModel.find({
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

                const follows = await FollowModel.find({
                    followingId: objectUserId,
                    status: "accepted",
                });

                follows.forEach(f => prioritizedUserIds.add(f.userId.toString()));
            }

            if (payload.role === Roles.EMPLOYEE) {
                const users = await userModel.find({ _id: { $ne: objectUserId } })

                users.forEach(u => prioritizedUserIds.add(u?._id as string));

            }

            const prioritizedUserIdArray = Array.from(prioritizedUserIds).map(
                id => new Types.ObjectId(id)
            );

            const allPosts = await PostModel.aggregate([
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
            ].map(id => new Types.ObjectId(id));

            const [users, candidateProfiles, employeeProfiles] = await Promise.all([
                userModel.find({ _id: { $in: uniqueUserIds } }).lean(),
                candidateProfileModel.find({ userId: { $in: uniqueUserIds } }).lean(),
                employeeProfileModel.find({ userId: { $in: uniqueUserIds } }).lean(),
            ]);

            const userMap = new Map(users.map(user => [user._id.toString(), user]));
            const candidateMap = new Map(candidateProfiles.map(p => [p.userId.toString(), p]));
            const employeeMap = new Map(employeeProfiles.map(p => [p.userId.toString(), p]));

            const finalPosts = allPosts.map(post => {
                const userIdStr = post.userId.toString();
                const user = userMap.get(userIdStr);
                const profile =
                    user?.role === Roles.CANDIDATE
                        ? candidateMap.get(userIdStr)
                        : employeeMap.get(userIdStr);

                return {
                    ...post,
                    userInfo: user || null,
                    userProfile: profile || null,
                };
            });

            const postIds = finalPosts.map(post => post._id);

            const likedPosts = await LikeModel.find({
                userId: objectUserId,
                postId: { $in: postIds }
            }).lean();

            const likedPostIds = new Set(likedPosts.map(lp => lp.postId.toString()));

            const postsWithLikeInfo = finalPosts.map(post => ({
                ...post,
                isLiked: likedPostIds.has(post._id.toString())
            }));

            // ✅ Fetch saved posts for the user and map them by postId
            const savedPosts = await SavedPostModel.find({
                userId: objectUserId,
                postId: { $in: postIds },
                userRole: payload?.role,
                isDeleted: false
            }).lean();

            // ✅ Map for quick lookup
            const savedPostMap = new Map(
                savedPosts.map(saved => [saved.postId.toString(), saved._id.toString()])
            );

            // ✅ Attach isSaved and savedPostId correctly
            const postsWithSavedInfo = postsWithLikeInfo.map((post) => {
                const postIdStr = post._id.toString();
                return {
                    ...post,
                    isSaved: savedPostMap.has(postIdStr),
                    savedPostId: savedPostMap.get(postIdStr) || null
                };
            });


            const allComments = await CommentModel.find({
                postId: { $in: postIds }
            }).lean();

            const commentIds = allComments.map(c => c._id);
            const replies = await ReplyModel.aggregate([
                { $match: { commentId: { $in: commentIds } } },
                { $group: { _id: "$commentId", count: { $sum: 1 } } }
            ]);
            const repliesCountMap = new Map(replies.map(r => [r._id.toString(), r.count]));

            const commenterUserIds = [
                ...new Set(allComments.map(c => c.userId.toString()))
            ].map(id => new Types.ObjectId(id));

            const [commentUsers, commentCandidateProfiles, commentEmployeeProfiles] = await Promise.all([
                userModel.find({ _id: { $in: commenterUserIds } }).lean(),
                candidateProfileModel.find({ userId: { $in: commenterUserIds } }).lean(),
                employeeProfileModel.find({ userId: { $in: commenterUserIds } }).lean(),
            ]);

            const commentUserMap = new Map(commentUsers.map(u => [u._id.toString(), u]));
            const commentCandidateMap = new Map(commentCandidateProfiles.map(p => [p.userId.toString(), p]));
            const commentEmployeeMap = new Map(commentEmployeeProfiles.map(p => [p.userId.toString(), p]));

            const postsWithComments = postsWithSavedInfo.map((post) => {
                const postIdStr = post._id.toString();

                const postComments = allComments
                    .filter(comment =>
                        comment.postId.toString() === postIdStr &&
                        comment.userId.toString() !== payload.id
                    )
                    .map(comment => {
                        const commenterId = comment.userId.toString();
                        const user = commentUserMap.get(commenterId);
                        const profile = user?.role === Roles.CANDIDATE
                            ? commentCandidateMap.get(commenterId)
                            : commentEmployeeMap.get(commenterId);

                        return {
                            ...comment,
                            userInfo: user || null,
                            userProfile: profile || null,
                            totalReplies: repliesCountMap.get(comment._id.toString()) || 0,
                        };
                    });

                const userSpecificComment = allComments
                    .filter(comment =>
                        comment.postId.toString() === postIdStr &&
                        comment.userId.toString() === payload.id
                    )
                    .map(comment => {
                        const commenterId = comment.userId.toString();
                        const user = commentUserMap.get(commenterId);
                        const profile = user?.role === Roles.CANDIDATE
                            ? commentCandidateMap.get(commenterId)
                            : commentEmployeeMap.get(commenterId);

                        return {
                            ...comment,
                            userInfo: user || null,
                            userProfile: profile || null,
                            totalReplies: repliesCountMap.get(comment._id.toString()) || 0,
                        };
                    });

                return {
                    ...post,
                    comments: postComments,
                    userSpecificComment
                };
            });

            return postsWithComments;
        } catch (error) {
            console.error("Error in findAllPosts:", error);
            return [];
        }
    }

    async getReplies(payload: getRepliesPayload): Promise<IReply[]> {
        try {
            let replies;

            if (payload.type === "reply") {
                // Fetch all replies where for === "reply" and parentReplyId === parentId
                replies = await ReplyModel.find({
                    parentReplyId: payload?.parentId,
                    for: "reply"
                }).lean();
            } else {
                // Original: fetch replies by commentId and type
                replies = await ReplyModel.find({
                    commentId: payload?.parentId,
                    for: payload?.type
                }).lean();
            }

            if (replies.length === 0) return [];

            // 2. Get unique user IDs from replies
            const userIds = [
                ...new Set(replies.map(reply => reply.userId.toString()))
            ].map(id => new Types.ObjectId(id));

            // 3. Fetch user and profile data
            const [users, candidateProfiles, employeeProfiles] = await Promise.all([
                userModel.find({ _id: { $in: userIds } }).lean(),
                candidateProfileModel.find({ userId: { $in: userIds } }).lean(),
                employeeProfileModel.find({ userId: { $in: userIds } }).lean()
            ]);

            const userMap = new Map(users.map(user => [user._id.toString(), user]));
            const candidateMap = new Map(candidateProfiles.map(p => [p.userId.toString(), p]));
            const employeeMap = new Map(employeeProfiles.map(p => [p.userId.toString(), p]));

            // --- Fetch nested replies count for each reply ---
            const replyIds = replies.map(r => r._id);
            const nestedRepliesCounts = await ReplyModel.aggregate([
                { $match: { parentReplyId: { $in: replyIds }, for: "reply" } },
                { $group: { _id: "$parentReplyId", count: { $sum: 1 } } }
            ]);

            // Convert aggregation result into a map for quick lookup
            const nestedRepliesCountMap = new Map<string, number>();
            nestedRepliesCounts.forEach(item => {
                nestedRepliesCountMap.set(item._id.toString(), item.count);
            });

            // 4. Attach user, profile info, and nested replies count to replies
            const enrichedReplies = replies.map(reply => {
                const userIdStr = reply.userId.toString();
                const user = userMap.get(userIdStr);
                const profile = user?.role === Roles.CANDIDATE
                    ? candidateMap.get(userIdStr)
                    : employeeMap.get(userIdStr);

                return {
                    ...reply,
                    userInfo: user || null,
                    userProfile: profile || null,
                    totalNestedReplies: nestedRepliesCountMap.get(reply._id.toString()) || 0
                };
            });

            return enrichedReplies;
        } catch (error) {
            console.error("Error in getReplies:", error);
            return [];
        }
    }

    async findUsersPosts(payload: {
        id: string; // profile owner (whose posts we are viewing)
        userId: string; // viewer (logged-in user)
        role: string;
        page?: number;
        pageSize?: number;
    }): Promise<{ totalPosts: number; posts: IPost[] }> {
        try {
            const profileOwnerId = new Types.ObjectId(payload.id); // Profile being viewed
            const viewerId = new Types.ObjectId(payload.userId);   // Logged-in user
            const prioritizedUserIds = new Set<string>();

            // 1. Collect connections and follows
            if (payload.role === Roles.CANDIDATE) {
                const connections = await ConnectionModel.find({
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

                const follows = await FollowModel.find({
                    userId: profileOwnerId,
                    status: "accepted",
                });

                follows.forEach(f => prioritizedUserIds.add(f.followingId.toString()));
            }

            if (payload.role === Roles.EMPLOYEE) {
                const follows = await FollowModel.find({
                    userId: profileOwnerId,
                    status: "accepted",
                    userType: "company",
                });

                follows.forEach(f => prioritizedUserIds.add(f.followingId.toString()));
            }

            const prioritizedUserIdArray = Array.from(prioritizedUserIds).map(id => new Types.ObjectId(id));

            // 2. Fetch posts
            const postsAggregation = await PostModel.aggregate([
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
            ].map(id => new Types.ObjectId(id));

            const [users, candidateProfiles, employeeProfiles] = await Promise.all([
                userModel.find({ _id: { $in: uniqueUserIds } }).lean(),
                candidateProfileModel.find({ userId: { $in: uniqueUserIds } }).lean(),
                employeeProfileModel.find({ userId: { $in: uniqueUserIds } }).lean(),
            ]);

            const userMap = new Map(users.map(user => [user._id.toString(), user]));
            const candidateMap = new Map(candidateProfiles.map(p => [p.userId.toString(), p]));
            const employeeMap = new Map(employeeProfiles.map(p => [p.userId.toString(), p]));

            const finalPosts = paginatedPosts.map(post => {
                const userIdStr = post.userId.toString();
                const user = userMap.get(userIdStr);
                const profile = user?.role === Roles.CANDIDATE ? candidateMap.get(userIdStr) : employeeMap.get(userIdStr);

                return {
                    ...post,
                    userInfo: user || null,
                    userProfile: profile || null,
                };
            });

            const postIds = finalPosts.map(post => post._id);

            // Likes by viewer
            const likedPosts = await LikeModel.find({
                userId: viewerId,
                postId: { $in: postIds },
            }).lean();

            const likedPostIds = new Set(likedPosts.map(lp => lp.postId.toString()));

            // Comments
            const allComments = await CommentModel.find({
                postId: { $in: postIds },
            }).lean();

            const commentIds = allComments.map(c => c._id);

            const replies = await ReplyModel.aggregate([
                { $match: { commentId: { $in: commentIds } } },
                { $group: { _id: "$commentId", count: { $sum: 1 } } },
            ]);
            const repliesCountMap = new Map(replies.map(r => [r._id.toString(), r.count]));

            const commenterUserIds = [
                ...new Set(allComments.map(c => c.userId.toString())),
            ].map(id => new Types.ObjectId(id));

            const [commentUsers, commentCandidateProfiles, commentEmployeeProfiles] = await Promise.all([
                userModel.find({ _id: { $in: commenterUserIds } }).lean(),
                candidateProfileModel.find({ userId: { $in: commenterUserIds } }).lean(),
                employeeProfileModel.find({ userId: { $in: commenterUserIds } }).lean(),
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
                        const profile = user?.role === Roles.CANDIDATE
                            ? commentCandidateMap.get(commenterId)
                            : commentEmployeeMap.get(commenterId);

                        return {
                            ...comment,
                            userInfo: user || null,
                            userProfile: profile || null,
                            totalReplies: repliesCountMap.get(comment._id.toString()) || 0,
                        };
                    });

                const userSpecificComment = allComments
                    .filter(comment => comment.postId.toString() === postIdStr && comment.userId.toString() === payload.userId)
                    .map(comment => {
                        const commenterId = comment.userId.toString();
                        const user = commentUserMap.get(commenterId);
                        const profile = user?.role === Roles.CANDIDATE
                            ? commentCandidateMap.get(commenterId)
                            : commentEmployeeMap.get(commenterId);

                        return {
                            ...comment,
                            userInfo: user || null,
                            userProfile: profile || null,
                            totalReplies: repliesCountMap.get(comment._id.toString()) || 0,
                        };
                    });

                return {
                    ...post,
                    isLiked: likedPostIds.has(post._id.toString()),
                    comments: postComments,
                    userSpecificComment,
                };
            });

            return {
                totalPosts,
                posts: postsWithComments,
            };
        } catch (error) {
            console.error("Error in findUsersPosts:", error);
            return {
                totalPosts: 0,
                posts: [],
            };
        }
    }


    async findAllSavedPosts(payload: {
        id: string;
        role: string;
        querys: string;
        page: number;
        pageSize: number;
    }): Promise<{ posts: IPost[]; totalPosts: number }> {
        try {
            console.log("Search query:", payload?.querys);

            const objectUserId = new Types.ObjectId(payload.id);
            const page = Math.max(1, payload.page || 1);
            const pageSize = Math.max(1, payload.pageSize || 10);

            // Step 1: Get saved posts by the user
            const savedPostsInitial = await SavedPostModel.find({
                userId: objectUserId,
                userRole: payload?.role,
                isDeleted: false
            }).lean();

            console.log("Saved posts found:", savedPostsInitial.length);

            const savedPostIds = savedPostsInitial.map(sp =>
                typeof sp.postId === 'string' ? new Types.ObjectId(sp.postId) : sp.postId
            );

            if (savedPostIds.length === 0) {
                return { posts: [], totalPosts: 0 };
            }

            // Step 2: Build post match filter with optional search
            const postMatchQuery: any = {
                _id: { $in: savedPostIds },
                isDeleted: false,
                status: true
            };

            if (payload.querys?.trim()) {
                postMatchQuery.posterName = { $regex: payload.querys.trim(), $options: 'i' };
            }

            const totalPosts = await PostModel.countDocuments(postMatchQuery);

            // Step 3: Fetch posts with pagination
            const allPosts = await PostModel.aggregate([
                { $match: postMatchQuery },
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * pageSize },
                { $limit: pageSize }
            ]);

            const uniqueUserIds = [
                ...new Set(allPosts.map(post => post.userId.toString()))
            ].map(id => new Types.ObjectId(id));

            const [users, candidateProfiles, employeeProfiles] = await Promise.all([
                userModel.find({ _id: { $in: uniqueUserIds } }).lean(),
                candidateProfileModel.find({ userId: { $in: uniqueUserIds } }).lean(),
                employeeProfileModel.find({ userId: { $in: uniqueUserIds } }).lean()
            ]);

            const userMap = new Map(users.map(user => [user._id.toString(), user]));
            const candidateMap = new Map(candidateProfiles.map(p => [p.userId.toString(), p]));
            const employeeMap = new Map(employeeProfiles.map(p => [p.userId.toString(), p]));

            const finalPosts = allPosts.map(post => {
                const userIdStr = post.userId.toString();
                const user = userMap.get(userIdStr);
                const profile =
                    user?.role === Roles.CANDIDATE
                        ? candidateMap.get(userIdStr)
                        : employeeMap.get(userIdStr);

                return {
                    ...post,
                    userInfo: user || null,
                    userProfile: profile || null
                };
            });

            const postIds = finalPosts.map(post => post._id);

            const likedPosts = await LikeModel.find({
                userId: objectUserId,
                postId: { $in: postIds }
            }).lean();

            const likedPostIds = new Set(likedPosts.map(lp => lp.postId.toString()));

            const postsWithLikeInfo = finalPosts.map(post => ({
                ...post,
                isLiked: likedPostIds.has(post._id.toString())
            }));

            const savedPostMap = new Map(
                savedPostsInitial.map(saved => [saved.postId.toString(), saved._id.toString()])
            );

            const postsWithSavedInfo = postsWithLikeInfo.map((post) => {
                const postIdStr = post._id.toString();
                return {
                    ...post,
                    isSaved: savedPostMap.has(postIdStr),
                    savedPostId: savedPostMap.get(postIdStr) || null
                };
            });

            const allComments = await CommentModel.find({
                postId: { $in: postIds }
            }).lean();

            const commentIds = allComments.map(c => c._id);
            const replies = await ReplyModel.aggregate([
                { $match: { commentId: { $in: commentIds } } },
                { $group: { _id: "$commentId", count: { $sum: 1 } } }
            ]);
            const repliesCountMap = new Map(replies.map(r => [r._id.toString(), r.count]));

            const commenterUserIds = [
                ...new Set(allComments.map(c => c.userId.toString()))
            ].map(id => new Types.ObjectId(id));

            const [commentUsers, commentCandidateProfiles, commentEmployeeProfiles] = await Promise.all([
                userModel.find({ _id: { $in: commenterUserIds } }).lean(),
                candidateProfileModel.find({ userId: { $in: commenterUserIds } }).lean(),
                employeeProfileModel.find({ userId: { $in: commenterUserIds } }).lean()
            ]);

            const commentUserMap = new Map(commentUsers.map(u => [u._id.toString(), u]));
            const commentCandidateMap = new Map(commentCandidateProfiles.map(p => [p.userId.toString(), p]));
            const commentEmployeeMap = new Map(commentEmployeeProfiles.map(p => [p.userId.toString(), p]));

            const postsWithComments = postsWithSavedInfo.map((post) => {
                const postIdStr = post._id.toString();

                const postComments = allComments
                    .filter(comment =>
                        comment.postId.toString() === postIdStr &&
                        comment.userId.toString() !== payload.id
                    )
                    .map(comment => {
                        const commenterId = comment.userId.toString();
                        const user = commentUserMap.get(commenterId);
                        const profile = user?.role === Roles.CANDIDATE
                            ? commentCandidateMap.get(commenterId)
                            : commentEmployeeMap.get(commenterId);

                        return {
                            ...comment,
                            userInfo: user || null,
                            userProfile: profile || null,
                            totalReplies: repliesCountMap.get(comment._id.toString()) || 0
                        };
                    });

                const userSpecificComment = allComments
                    .filter(comment =>
                        comment.postId.toString() === postIdStr &&
                        comment.userId.toString() === payload.id
                    )
                    .map(comment => {
                        const commenterId = comment.userId.toString();
                        const user = commentUserMap.get(commenterId);
                        const profile = user?.role === Roles.CANDIDATE
                            ? commentCandidateMap.get(commenterId)
                            : commentEmployeeMap.get(commenterId);

                        return {
                            ...comment,
                            userInfo: user || null,
                            userProfile: profile || null,
                            totalReplies: repliesCountMap.get(comment._id.toString()) || 0
                        };
                    });

                return {
                    ...post,
                    comments: postComments,
                    userSpecificComment
                };
            });

            return { posts: postsWithComments, totalPosts };
        } catch (error) {
            console.error("Error in findAllSavedPosts:", error);
            return { posts: [], totalPosts: 0 };
        }
    }

}