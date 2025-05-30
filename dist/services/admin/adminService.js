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
exports.AdminService = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("../../utils/constants");
const enums_1 = require("../../utils/enums");
const httpError_1 = require("../../utils/httpError");
const post_1 = require("../../models/post/post");
class AdminService {
    constructor(_userRepository, _jobPostRepository, _postRepository) {
        this._userRepository = _userRepository;
        this._jobPostRepository = _jobPostRepository;
        this._postRepository = _postRepository;
    }
    adminLogin(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((payload === null || payload === void 0 ? void 0 : payload.email) === process.env.ADMIN_EMAIL && (payload === null || payload === void 0 ? void 0 : payload.password) === process.env.ADMIN_PASSWORD) {
                return true;
            }
            else {
                throw new httpError_1.HttpError(constants_1.AdminErrorMessages.ADMIN_INVALID_CRENDIALS, enums_1.StatusCode.BAD_REQUEST);
            }
        });
    }
    getPosts(page, pageSize, querys, userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const skip = (page - 1) * pageSize;
            const matchStage = { isDeleted: false };
            if (querys) {
                matchStage.$or = [
                    { posterName: { $regex: querys, $options: 'i' } }
                ];
            }
            if (userId) {
                matchStage.userId = new mongoose_1.Types.ObjectId(userId);
            }
            const pipeline = [
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
            const countPipeline = [
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
            const [posts, totalCount] = yield Promise.all([
                post_1.PostModel.aggregate(pipeline),
                post_1.PostModel.aggregate(countPipeline),
            ]);
            const totalPosts = ((_a = totalCount[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
            return { posts, totalPosts };
        });
    }
    getStatistics() {
        return __awaiter(this, void 0, void 0, function* () {
            const totalCandidates = yield this._userRepository.countDocuments({ role: "candidate" });
            const totalEmployees = yield this._userRepository.countDocuments({ role: "employee" });
            const totalJobs = yield this._jobPostRepository.countDocuments({ status: true });
            const totalPosts = yield this._postRepository.countDocuments({ isDeleted: false });
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            const lastMonthPosts = yield this._postRepository.countDocuments({
                isDeleted: false,
                createdAt: { $gte: oneMonthAgo, $lte: new Date() },
            });
            const lastMonthJobs = yield this._jobPostRepository.countDocuments({
                isDeleted: false,
                createdAt: { $gte: oneMonthAgo, $lte: new Date() },
            });
            const lastMonthUsers = yield this._userRepository.countDocuments({
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
                };
            }
        });
    }
}
exports.AdminService = AdminService;
