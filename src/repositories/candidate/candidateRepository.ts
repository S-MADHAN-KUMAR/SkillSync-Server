
import mongoose from "mongoose";
import { ICandidateProfile } from "../../interfaces/ICandidateProfile";
import candidateProfileModel from "../../models/candidateProfileModel";
import { GenericRepository } from "../genericRepository";
import { ICandidateRepository } from "../interface/ICandidateRepository";
import { UserErrorMessages } from "../../utils/constants";
import { HttpError } from "../../utils/httpError";
import { StatusCode } from "../../utils/enums";


export class CandidateRepository
    extends GenericRepository<ICandidateProfile>
    implements ICandidateRepository {
    constructor() {
        super(candidateProfileModel);
    }

    async findAllCandidates(
        page: number,
        pageSize: number,
        querys?: string,
        location?: string,
        userId?: string,
        omit?: string
    ): Promise<{ candidates: any[]; totalCandidates: number }> {
        const skip = (page - 1) * pageSize;
        const match: any = {};

        if (querys) {
            match.name = { $regex: querys, $options: "i" };
        }

        if (location) {
            match.state = { $regex: location, $options: "i" };
        }

        const omitObjectId = omit ? new mongoose.Types.ObjectId(omit) : null;

        const pipeline: any[] = [
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
                                        { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] },
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

        const candidates = await candidateProfileModel.aggregate(pipeline);

        const totalCandidates = await candidateProfileModel.countDocuments({
            ...match,
            ...(omit ? { userId: { $ne: omitObjectId } } : {})
        });

        if (candidates.length === 0) {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
        }

        return {
            candidates,
            totalCandidates
        };
    }





}

