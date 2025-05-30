import { Types } from "mongoose";
import { IPost } from "../../interfaces/post/IPost";
import { login } from "../../types/types";
import { AdminErrorMessages } from "../../utils/constants";
import { StatusCode } from "../../utils/enums";
import { HttpError } from "../../utils/httpError";
import { IAdminService } from "../interface/IAdminService";
import { PostModel } from "../../models/post/post";
import { IUserRepository } from "../../repositories/interface/IUserRepository";
import { IJobPostRepository } from "../../repositories/interface/IJobPostRepository";
import { IPostRepository } from "../../repositories/interface/IPostRepository";

export class AdminService implements IAdminService {
    private _userRepository: IUserRepository;
    private _jobPostRepository: IJobPostRepository;
    private _postRepository: IPostRepository;

    constructor(
        _userRepository: IUserRepository,
        _jobPostRepository: IJobPostRepository,
        _postRepository: IPostRepository
    ) {
        this._userRepository = _userRepository;
        this._jobPostRepository = _jobPostRepository;
        this._postRepository = _postRepository;
    }
    async adminLogin(payload: login): Promise<Boolean | null> {
        if (payload?.email === process.env.ADMIN_EMAIL && payload?.password === process.env.ADMIN_PASSWORD) {
            return true
        } else {
            throw new HttpError(AdminErrorMessages.ADMIN_INVALID_CRENDIALS, StatusCode.BAD_REQUEST)
        }
    }

    async getPosts(
        page: number,
        pageSize: number,
        querys?: any,
        userId?: string,
        role?: string
    ): Promise<{ posts: IPost[]; totalPosts: number }> {
        const skip = (page - 1) * pageSize;
        const matchStage: any = { isDeleted: false };

        if (querys) {
            matchStage.$or = [
                { posterName: { $regex: querys, $options: 'i' } }
            ];
        }

        if (userId) {
            matchStage.userId = new Types.ObjectId(userId);
        }

        const pipeline: any[] = [
            // Match by post-level filters first
            { $match: matchStage },

            // Lookup user
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },

            // Optional filter by user.role
            ...(role ? [{ $match: { 'user.role': role } }] : []),

            // Lookup candidate profile
            {
                $lookup: {
                    from: 'candidateprofiles',
                    localField: 'user._id',
                    foreignField: 'userId',
                    as: 'candidateProfile',
                },
            },
            { $unwind: { path: '$candidateProfile', preserveNullAndEmptyArrays: true } },

            // Lookup employee profile
            {
                $lookup: {
                    from: 'employeeprofiles',
                    localField: 'user._id',
                    foreignField: 'userId',
                    as: 'employeeProfile',
                },
            },
            { $unwind: { path: '$employeeProfile', preserveNullAndEmptyArrays: true } },

            // Sort + paginate
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: pageSize },
        ];

        const countPipeline: any[] = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            ...(role ? [{ $match: { 'user.role': role } }] : []),
            { $count: 'total' },
        ];

        const [posts, totalCount] = await Promise.all([
            PostModel.aggregate(pipeline),
            PostModel.aggregate(countPipeline),
        ]);

        const totalPosts = totalCount[0]?.total || 0;

        return { posts, totalPosts };
    }

    async getStatistics(): Promise<any | null> {
        const totalCandidates = await this._userRepository.countDocuments({ role: "candidate" })
        const totalEmployees = await this._userRepository.countDocuments({ role: "employee" })
        const totalJobs = await this._jobPostRepository.countDocuments({ status: true })
        const totalPosts = await this._postRepository.countDocuments({ isDeleted: false })
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const lastMonthPosts = await this._postRepository.countDocuments({
            isDeleted: false,
            createdAt: { $gte: oneMonthAgo, $lte: new Date() },
        });
        const lastMonthJobs = await this._jobPostRepository.countDocuments({
            isDeleted: false,
            createdAt: { $gte: oneMonthAgo, $lte: new Date() },
        });
        const lastMonthUsers = await this._userRepository.countDocuments({
            status: false,
            createdAt: { $gte: oneMonthAgo, $lte: new Date() },
        });


        if (totalCandidates &&
            totalEmployees &&
            totalJobs &&
            totalPosts) {
            return {
                totalCandidates,
                totalEmployees,
                totalJobs,
                totalPosts,
                lastMonthPosts,
                lastMonthJobs,
                lastMonthUsers
            }
        }
    }

}