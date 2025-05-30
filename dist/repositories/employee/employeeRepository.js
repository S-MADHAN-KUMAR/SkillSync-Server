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
exports.EmployeeRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const employeeProfileModel_1 = __importDefault(require("../../models/employeeProfileModel"));
const genericRepository_1 = require("../genericRepository");
const httpError_1 = require("../../utils/httpError");
const constants_1 = require("../../utils/constants");
const enums_1 = require("../../utils/enums");
class EmployeeRepository extends genericRepository_1.GenericRepository {
    constructor() {
        super(employeeProfileModel_1.default);
    }
    findAllEmployees(page, pageSize, querys, location, omit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * pageSize;
            const match = {};
            if (querys) {
                match.companyName = { $regex: querys, $options: "i" };
            }
            if (location) {
                match.companyState = { $regex: location, $options: "i" };
            }
            const omitObjectId = omit ? new mongoose_1.default.Types.ObjectId(omit) : null;
            const pipeline = [
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
            const employees = yield employeeProfileModel_1.default.aggregate(pipeline);
            const totalEmployees = yield employeeProfileModel_1.default.countDocuments(Object.assign(Object.assign({}, match), (omit ? { userId: { $ne: omitObjectId } } : {})));
            if (employees.length === 0) {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
            return {
                employees,
                totalEmployees,
            };
        });
    }
}
exports.EmployeeRepository = EmployeeRepository;
