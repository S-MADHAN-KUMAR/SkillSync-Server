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
exports.EmployeeService = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("../../utils/constants");
const enums_1 = require("../../utils/enums");
const httpError_1 = require("../../utils/httpError");
class EmployeeService {
    constructor(_employeeRepository, _userRepository, _jobRepository, _applicationRepository, _savedJobsRepository, _savedCandidatesRepository, _postRepository) {
        this._employeeRepository = _employeeRepository;
        this._userRepository = _userRepository;
        this._jobRepository = _jobRepository;
        this._applicationRepository = _applicationRepository;
        this._savedJobsRepository = _savedJobsRepository;
        this._savedCandidatesRepository = _savedCandidatesRepository;
        this._postRepository = _postRepository;
    }
    updateOrCreate(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const userFound = yield this._userRepository.findOne({
                _id: id,
                role: 'employee'
            });
            if (!userFound) {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
            const updatedPayload = Object.assign(Object.assign({}, payload), { userId: id });
            const employeeProfileExist = yield this._employeeRepository.findOne({ userId: id });
            let response;
            let updatedUser = null;
            if (!employeeProfileExist) {
                response = yield this._employeeRepository.create(updatedPayload);
                if (response) {
                    updatedUser = yield this._userRepository.update(id, { employeeProfileId: response === null || response === void 0 ? void 0 : response._id, profile: response === null || response === void 0 ? void 0 : response.logo });
                }
            }
            else {
                response = yield this._employeeRepository.update(employeeProfileExist === null || employeeProfileExist === void 0 ? void 0 : employeeProfileExist._id, updatedPayload);
                updatedUser = yield this._userRepository.update(id, { employeeProfileId: response === null || response === void 0 ? void 0 : response._id, profile: response === null || response === void 0 ? void 0 : response.logo });
                yield this._jobRepository.updateMany({ employeeId: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser._id }, {
                    logo: response === null || response === void 0 ? void 0 : response.logo,
                    companyName: response === null || response === void 0 ? void 0 : response.companyName,
                });
            }
            return { response, userData: updatedUser };
        });
    }
    getEmployeeProfile(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._employeeRepository.findById(id);
            if (response) {
                return response;
            }
            else {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    createJob(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!payload.employeeId) {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_FOUND, enums_1.StatusCode.BAD_REQUEST);
            }
            const found = yield this._employeeRepository.findOne({ userId: payload.employeeId });
            if (!found) {
                throw new httpError_1.HttpError(constants_1.JobPostErrorMessages.JOB_FAILD_TO_CREATE, enums_1.StatusCode.NOT_FOUND);
            }
            const response = yield this._jobRepository.create(Object.assign(Object.assign({}, payload), { logo: found.logo, companyName: found.companyName }));
            if (!response) {
                throw new httpError_1.HttpError(constants_1.JobPostErrorMessages.JOB_FAILD_TO_CREATE, enums_1.StatusCode.BAD_REQUEST);
            }
            yield this._employeeRepository.updateMany({ userId: payload.employeeId }, { $push: { jobPosts: response._id } });
            return response;
        });
    }
    updateJob(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._jobRepository.update(id, payload);
            if (response) {
                return response;
            }
            else {
                throw new httpError_1.HttpError(constants_1.JobPostErrorMessages.JOB_FAILD_TO_CREATE, enums_1.StatusCode.BAD_REQUEST);
            }
        });
    }
    getAllJobs(page, pageSize, querys, id, // <- 4th param
    location, jobType, salary, skill, active, // <- 9th param
    expiredBefore) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * pageSize;
            const filter = {};
            if (querys) {
                filter.jobTitle = { $regex: querys, $options: 'i' };
            }
            if (location) {
                filter.state = { $regex: location, $options: 'i' };
            }
            if (jobType) {
                filter.jobType = jobType;
            }
            if (salary) {
                const salaryValue = Number(salary);
                if (!isNaN(salaryValue)) {
                    filter.$or = [
                        { minSalary: { $lte: salaryValue } },
                        { maxSalary: { $gte: salaryValue } }
                    ];
                }
            }
            if (skill) {
                filter.tags = { $in: [skill] };
            }
            if (active && typeof active === 'boolean') {
                filter.status = active;
            }
            if (expiredBefore && expiredBefore instanceof Date) {
                filter.expiredAt = { $gte: expiredBefore };
            }
            // Step 1: Fetch jobs and total count
            const jobs = yield this._jobRepository.findAll(filter, skip, pageSize);
            const totalJobs = yield this._jobRepository.countDocuments(filter);
            // Step 2: Enrich jobs with isSavedJob if user id provided
            if (id && jobs && jobs.length > 0) {
                const objectUserId = new mongoose_1.Types.ObjectId(id);
                // Get all saved jobs for the user
                const savedJobs = yield this._savedJobsRepository.findAll({
                    userId: objectUserId,
                    isDeleted: false,
                });
                const savedJobMap = new Map();
                savedJobs.forEach((saved) => {
                    savedJobMap.set(saved.jobId.toString(), { _id: saved === null || saved === void 0 ? void 0 : saved._id.toString() });
                });
                // Attach isSavedJob & savedJobId to each job
                const enrichedJobs = jobs.map((job) => {
                    var _a, _b;
                    const jobId = job === null || job === void 0 ? void 0 : job._id.toString();
                    const savedEntry = savedJobMap.get(jobId);
                    return Object.assign(Object.assign({}, (_b = (_a = job.toObject) === null || _a === void 0 ? void 0 : _a.call(job)) !== null && _b !== void 0 ? _b : job), { isSavedJob: !!savedEntry, savedJobId: savedEntry === null || savedEntry === void 0 ? void 0 : savedEntry._id });
                });
                return { jobs: enrichedJobs, totalJobs };
            }
            if (jobs) {
                // If no user ID, return jobs without isSavedJob
                const enrichedJobs = jobs.map(job => {
                    var _a, _b;
                    return (Object.assign(Object.assign({}, (_b = (_a = job.toObject) === null || _a === void 0 ? void 0 : _a.call(job)) !== null && _b !== void 0 ? _b : job), { isSavedJob: false }));
                });
                return { jobs: enrichedJobs, totalJobs };
            }
            else {
                throw new httpError_1.HttpError(constants_1.JobPostErrorMessages.JOB_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    getRecentJobs(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._jobRepository.findRecentJobs(id);
            if (response) {
                return response;
            }
            else {
                throw new httpError_1.HttpError(constants_1.JobPostErrorMessages.JOB_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    editJob(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._jobRepository.update(id, payload);
            if (response) {
                return response;
            }
            else {
                throw new httpError_1.HttpError(constants_1.JobPostErrorMessages.JOB_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    toggleStatus(id, currentStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedStatus = !currentStatus;
            console.log("Updated Status:", updatedStatus);
            const response = yield this._jobRepository.update(id, { status: updatedStatus });
            if (!response) {
                throw new httpError_1.HttpError(constants_1.JobPostErrorMessages.JOB_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
            return true;
        });
    }
    getJobs(id, page, pageSize, querys, location, jobType, salary) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * pageSize;
            const filter = {
                employeeId: id
            };
            if (querys) {
                filter.jobTitle = { $regex: querys, $options: 'i' };
            }
            if (location) {
                filter.state = { $regex: location, $options: 'i' };
            }
            if (jobType) {
                filter.jobType = jobType;
            }
            if (salary) {
                const salaryValue = Number(salary);
                if (!isNaN(salaryValue)) {
                    filter.$or = [
                        { minSalary: { $lte: salaryValue } },
                        { maxSalary: { $gte: salaryValue } }
                    ];
                }
            }
            const jobs = yield this._jobRepository.findAll(filter, skip, pageSize);
            const totalJobs = yield this._jobRepository.countDocuments(filter);
            if (jobs && jobs.length > 0) {
                return { jobs, totalJobs };
            }
            else {
                throw new httpError_1.HttpError(constants_1.JobPostErrorMessages.JOB_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    getJob(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = payload === null || payload === void 0 ? void 0 : payload.id;
                const userId = payload === null || payload === void 0 ? void 0 : payload.userId;
                // 1. Find the job by ID
                const job = yield this._jobRepository.findById(id);
                if (!job) {
                    throw new httpError_1.HttpError("Job not found", enums_1.StatusCode.BAD_REQUEST);
                }
                // 2. Check if the user has an application for this job
                const application = yield this._applicationRepository.findOne({
                    jobId: id,
                    candidateId: userId,
                    isDeleted: false
                });
                // 3. Return job with application if exists
                return application
                    ? Object.assign(Object.assign({}, job.toObject()), { application }) : job;
            }
            catch (error) {
                console.error("Error in getJob:", error);
                throw new httpError_1.HttpError("Failed to fetch job details", enums_1.StatusCode.BAD_REQUEST);
            }
        });
    }
    getEmployeeDetail(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._employeeRepository.findById(id);
            if (response) {
                return response;
            }
            else {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    getAllEmployees(page, pageSize, querys, location, omit) {
        return __awaiter(this, void 0, void 0, function* () {
            const { employees, totalEmployees } = yield this._employeeRepository.findAllEmployees(page, pageSize, querys, location, omit);
            return { employees, totalEmployees };
        });
    }
    getStatistics(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalJobs = yield this._jobRepository.countDocuments({ employeeId: id });
            const savedPosts = yield this._postRepository.countDocuments({ userId: id, isDeleted: false });
            const savedCandidates = yield this._savedCandidatesRepository.countDocuments({
                userId: id,
                isDeleted: false
            });
            console.log(totalJobs, savedPosts, savedCandidates);
            if (totalJobs &&
                savedPosts &&
                savedCandidates) {
                return {
                    totalJobs,
                    savedPosts,
                    savedCandidates
                };
            }
            else {
                throw new httpError_1.HttpError(constants_1.JobPostErrorMessages.JOB_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
}
exports.EmployeeService = EmployeeService;
