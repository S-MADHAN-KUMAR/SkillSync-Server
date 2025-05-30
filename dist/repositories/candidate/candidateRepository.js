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
exports.CandidateRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const candidateProfileModel_1 = __importDefault(require("../../models/candidateProfileModel"));
const genericRepository_1 = require("../genericRepository");
const constants_1 = require("../../utils/constants");
const httpError_1 = require("../../utils/httpError");
const enums_1 = require("../../utils/enums");
class CandidateRepository extends genericRepository_1.GenericRepository {
    constructor() {
        super(candidateProfileModel_1.default);
    }
    findAllCandidates(page, pageSize, querys, location, userId, omit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * pageSize;
            const match = {};
            if (querys) {
                match.name = { $regex: querys, $options: "i" };
            }
            if (location) {
                match.state = { $regex: location, $options: "i" };
            }
            const omitObjectId = omit ? new mongoose_1.default.Types.ObjectId(omit) : null;
            const pipeline = [
                // Initial match filter (name, state, etc)
                { $match: match },
                // Exclude the current user from results
                ...(omit
                    ? [{ $match: { userId: { $ne: omitObjectId } } }]
                    : []),
                // Lookup connection info
                {
                    $lookup: {
                        from: "connections",
                        let: { candidateUserId: "$userId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$connectedUserId", "$$candidateUserId"] },
                                            { $eq: ["$userId", omitObjectId] },
                                            { $in: ["$status", ["pending", "accepted"]] }
                                        ]
                                    }
                                }
                            },
                            { $project: { status: 1, _id: 0 } }
                        ],
                        as: "connectionInfo"
                    }
                },
                // Add connection flags
                {
                    $addFields: {
                        isConnected: { $gt: [{ $size: "$connectionInfo" }, 0] },
                        connectionStatus: {
                            $cond: [
                                { $gt: [{ $size: "$connectionInfo" }, 0] },
                                { $arrayElemAt: ["$connectionInfo.status", 0] },
                                null
                            ]
                        }
                    }
                },
                // Clean up connectionInfo field
                { $project: { connectionInfo: 0 } },
                // Lookup saved candidates where isDeleted is false
                {
                    $lookup: {
                        from: "savedcandidates",
                        let: { candidateId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$candidateId", "$$candidateId"] },
                                            { $eq: ["$userId", new mongoose_1.default.Types.ObjectId(userId)] },
                                            { $eq: ["$isDeleted", false] } // <-- only include if not deleted
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "savedCandidate"
                    }
                },
                // Add isSaved flag and flatten savedCandidate
                {
                    $addFields: {
                        isSaved: { $gt: [{ $size: "$savedCandidate" }, 0] },
                        savedCandidate: {
                            $cond: [
                                { $gt: [{ $size: "$savedCandidate" }, 0] },
                                { $arrayElemAt: ["$savedCandidate", 0] },
                                null
                            ]
                        }
                    }
                },
                // Pagination
                { $skip: skip },
                { $limit: pageSize }
            ];
            const candidates = yield candidateProfileModel_1.default.aggregate(pipeline);
            const totalCandidates = yield candidateProfileModel_1.default.countDocuments(Object.assign(Object.assign({}, match), (omit ? { userId: { $ne: omitObjectId } } : {})));
            if (candidates.length === 0) {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
            return {
                candidates,
                totalCandidates
            };
        });
    }
}
exports.CandidateRepository = CandidateRepository;
