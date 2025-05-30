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
exports.ApplicationsService = void 0;
const enums_1 = require("../../utils/enums");
const httpError_1 = require("../../utils/httpError");
class ApplicationsService {
    constructor(_candidateRepository, _userRepository, _applicationRepository, _jobPostRepository) {
        this._candidateRepository = _candidateRepository;
        this._userRepository = _userRepository;
        this._applicationRepository = _applicationRepository;
        this._jobPostRepository = _jobPostRepository;
    }
    apply(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const exist = yield this._applicationRepository.findOne({
                jobId: payload === null || payload === void 0 ? void 0 : payload.jobId,
                candidateId: payload === null || payload === void 0 ? void 0 : payload.candidateId,
                status: "applied"
            });
            if (exist) {
                throw new httpError_1.HttpError('Already Applied. Please wait for a response.', enums_1.StatusCode.OK);
            }
            const res = yield this._applicationRepository.create({
                jobId: payload === null || payload === void 0 ? void 0 : payload.jobId,
                candidateId: payload === null || payload === void 0 ? void 0 : payload.candidateId,
                status: "applied",
                appliedAt: new Date(),
                isDeleted: false
            });
            if (res) {
                // Increment application count in JobPost
                yield this._jobPostRepository.incrementField(res.jobId.toString(), "applications", 1);
                return true;
            }
            else {
                return false;
            }
        });
    }
    updateApplicationStatus(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const updated = yield this._applicationRepository.update(payload === null || payload === void 0 ? void 0 : payload.id, { status: payload === null || payload === void 0 ? void 0 : payload.status });
            if (updated) {
                return true;
            }
            else {
                return false;
            }
        });
    }
    getAllApplications(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, pageSize, query, jobId } = payload;
            const job = yield this._jobPostRepository.findOne({ _id: jobId, status: true });
            if (!job)
                return null;
            const skip = (page - 1) * pageSize;
            const filter = { jobId };
            // Get all matching candidateIds if a query is provided
            let matchedCandidateIds = [];
            if (query) {
                const matchingProfiles = yield this._candidateRepository.findAll({
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { bio: { $regex: query, $options: 'i' } }
                    ]
                });
                matchedCandidateIds = matchingProfiles.map(profile => profile.userId.toString());
                // If no candidate matches the search, return empty results early
                if (matchedCandidateIds.length === 0) {
                    return {
                        applications: [],
                        totalPages: 0
                    };
                }
                filter.candidateId = { $in: matchedCandidateIds };
            }
            const [applications, totalApplications] = yield Promise.all([
                this._applicationRepository.findAll(filter, skip, pageSize),
                this._applicationRepository.countDocuments(filter)
            ]);
            const applicationsWithProfiles = yield Promise.all(applications.map((application) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const candidateProfile = yield this._candidateRepository.findOne({
                    userId: application.candidateId,
                });
                return Object.assign(Object.assign({}, (_b = (_a = application.toObject) === null || _a === void 0 ? void 0 : _a.call(application)) !== null && _b !== void 0 ? _b : application), { candidateProfile });
            })));
            const totalPages = Math.ceil(totalApplications / pageSize);
            return {
                applications: applicationsWithProfiles,
                totalPages,
            };
        });
    }
    getUserApplications(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, pageSize, query, userId } = payload;
            // Step 1: Fetch all applications for the user
            const allApplications = yield this._applicationRepository.findAll({
                candidateId: userId,
                isDeleted: false,
            });
            // Step 2: Attach job info to each application
            const applicationsWithJobs = yield Promise.all(allApplications.map((app) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const job = yield this._jobPostRepository.findById(app === null || app === void 0 ? void 0 : app.jobId.toString());
                return Object.assign(Object.assign({}, ((_a = app.toObject) === null || _a === void 0 ? void 0 : _a.call(app)) || app), { job });
            })));
            // Step 3: Filter by jobTitle or companyName if query exists
            const filteredApplications = query
                ? applicationsWithJobs.filter((app) => {
                    var _a, _b, _c, _d;
                    const jobTitle = ((_b = (_a = app === null || app === void 0 ? void 0 : app.job) === null || _a === void 0 ? void 0 : _a.jobTitle) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || '';
                    const companyName = ((_d = (_c = app === null || app === void 0 ? void 0 : app.job) === null || _c === void 0 ? void 0 : _c.companyName) === null || _d === void 0 ? void 0 : _d.toLowerCase()) || '';
                    const searchTerm = query.toLowerCase();
                    return jobTitle.includes(searchTerm) || companyName.includes(searchTerm);
                })
                : applicationsWithJobs;
            // Step 4: Paginate
            const startIndex = (page - 1) * pageSize;
            const paginatedApplications = filteredApplications.slice(startIndex, startIndex + pageSize);
            // Step 5: Total pages from filtered results
            const totalPages = Math.ceil(filteredApplications.length / pageSize);
            return {
                applications: paginatedApplications,
                totalPages,
            };
        });
    }
}
exports.ApplicationsService = ApplicationsService;
