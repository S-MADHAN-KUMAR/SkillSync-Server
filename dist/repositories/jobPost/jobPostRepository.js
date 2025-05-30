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
exports.JobRepository = void 0;
const jobPostModel_1 = __importDefault(require("../../models/jobPostModel"));
const genericRepository_1 = require("../genericRepository");
class JobRepository extends genericRepository_1.GenericRepository {
    constructor() {
        super(jobPostModel_1.default);
    }
    findRecentJobs(employeeId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const jobs = yield jobPostModel_1.default
                    .find({ employeeId })
                    .sort({ postedAt: -1 })
                    .limit(10);
                return jobs;
            }
            catch (error) {
                console.error('Error fetching recent jobs:', error);
                throw new Error('Failed to fetch recent jobs');
            }
        });
    }
}
exports.JobRepository = JobRepository;
