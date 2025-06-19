import mongoose, { PipelineStage, Types } from "mongoose";
import { IEmployeeProfile } from "../../interfaces/IEmployeeProfile";
import employeeProfileModel from "../../models/employeeProfileModel";
import { GenericRepository } from "../genericRepository";
import { IEmployeeRepository } from "../interface/IEmployeeRepository";
import { HttpError } from "../../utils/httpError";
import { UserErrorMessages } from "../../utils/constants";
import { StatusCode } from "../../utils/enums";
import { IJobPost } from "../../interfaces/IJobPost";
import jobPostModel from "../../models/jobPostModel";

export class EmployeeRepository
    extends GenericRepository<IEmployeeProfile>
    implements IEmployeeRepository {
    constructor() {
        super(employeeProfileModel);
    }

    async findAllEmployees(
        page: number,
        pageSize: number,
        querys?: string,
        location?: string,
        omit?: string
    ): Promise<{ employees: IEmployeeProfile[]; totalEmployees: number }> {
        const skip = (page - 1) * pageSize;
        const match: Record<string, unknown> = {};

        if (querys) {
            match.companyName = { $regex: querys, $options: "i" };
        }

        if (location) {
            match.companyState = { $regex: location, $options: "i" };
        }

        const omitObjectId = omit ? new mongoose.Types.ObjectId(omit) : null;

        const pipeline: PipelineStage[] = [
            { $match: match },

            ...(omit ? [{ $match: { userId: { $ne: omitObjectId } } }] : []),

            {
                $lookup: {
                    from: "follows",
                    let: { employeeUserId: "$userId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$userId", "$$employeeUserId"] }, // who is querying
                                        { $eq: ["$followingId", omitObjectId] }, // matched employee
                                        { $in: ["$status", ["pending", "accepted"]] },
                                    ],
                                },
                            },
                        },
                        { $project: { status: 1, _id: 0 } },
                    ],
                    as: "connectionInfo",
                },
            },

            {
                $addFields: {
                    isConnected: { $gt: [{ $size: "$connectionInfo" }, 0] },
                    connectionStatus: {
                        $cond: [
                            { $gt: [{ $size: "$connectionInfo" }, 0] },
                            { $arrayElemAt: ["$connectionInfo.status", 0] },
                            null,
                        ],
                    },
                },
            },

            { $project: { connectionInfo: 0 } },
            { $skip: skip },
            { $limit: pageSize },
        ];

        const employees = await employeeProfileModel.aggregate(pipeline);

        const totalEmployees = await employeeProfileModel.countDocuments({
            ...match,
            ...(omit ? { userId: { $ne: omitObjectId } } : {}),
        });

        if (employees.length === 0) {
            throw new HttpError(
                UserErrorMessages.USER_NOT_FOUND,
                StatusCode.NOT_FOUND
            );
        }

        return {
            employees,
            totalEmployees,
        };
    }

}
