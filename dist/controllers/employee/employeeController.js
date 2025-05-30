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
exports.EmployeeController = void 0;
const enums_1 = require("../../utils/enums");
const constants_1 = require("../../utils/constants");
const uploadToCloudinary_1 = require("../../utils/uploadToCloudinary");
class EmployeeController {
    constructor(_employeeService) {
        this._employeeService = _employeeService;
    }
    updateOrCreate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const id = req.params.id;
                const files = req.files;
                let logoUrl = '';
                let bannerUrl = '';
                if (files.logo && files.logo[0] && !(payload.logo && payload.logo.startsWith(process.env.CLOUDINARY_URL))) {
                    const logoFile = files.logo[0];
                    if (logoFile.mimetype.startsWith('image/')) {
                        logoUrl = yield (0, uploadToCloudinary_1.uploadFileToCloudinary)(logoFile.buffer, 'image', 'logo_images');
                    }
                    else if (logoFile.mimetype === 'application/pdf') {
                        logoUrl = yield (0, uploadToCloudinary_1.uploadFileToCloudinary)(logoFile.buffer, 'pdf', 'pdf_files');
                    }
                    else {
                        throw new Error('Invalid file type for logo. Only image or PDF is allowed.');
                    }
                }
                else if (payload.logo) {
                    logoUrl = payload.logo;
                }
                if (files.banner && files.banner[0] && !(payload.banner && payload.banner.startsWith(process.env.CLOUDINARY_URL))) {
                    const bannerFile = files.banner[0];
                    if (bannerFile.mimetype.startsWith('image/')) {
                        bannerUrl = yield (0, uploadToCloudinary_1.uploadFileToCloudinary)(bannerFile.buffer, 'image', 'banner_images');
                    }
                    else if (bannerFile.mimetype === 'application/pdf') {
                        bannerUrl = yield (0, uploadToCloudinary_1.uploadFileToCloudinary)(bannerFile.buffer, 'pdf', 'pdf_files');
                    }
                    else {
                        throw new Error('Invalid file type for banner. Only image or PDF is allowed.');
                    }
                }
                else if (payload.banner) {
                    bannerUrl = payload.banner;
                }
                payload.logo = logoUrl;
                payload.banner = bannerUrl;
                const { response, userData } = yield this._employeeService.updateOrCreate(payload, id);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    message: constants_1.UserSuccessMessages.USER_UPDATED,
                    employee: userData,
                });
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    getEmployeeProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const employee = yield this._employeeService.getEmployeeProfile(id);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    employee,
                });
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    createJob(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const response = yield this._employeeService.createJob(payload);
                if (!response) {
                    res.status(enums_1.StatusCode.BAD_REQUEST).json({
                        success: false,
                        message: constants_1.JobPostErrorMessages.JOB_FAILD_TO_CREATE
                    });
                }
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    message: constants_1.JobPost.JOB_CREATED
                });
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    updateJob(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const id = req.params.id;
                const response = yield this._employeeService.updateJob(payload, id);
                if (!response) {
                    res.status(enums_1.StatusCode.BAD_REQUEST).json({
                        success: false,
                        message: constants_1.JobPostErrorMessages.JOB_FAILD_TO_CREATE
                    });
                }
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    message: constants_1.JobPost.JOB_UPDATED
                });
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    getAllJobs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 10;
                const query = req.query.querys || "";
                const location = req.query.location || "";
                const jobType = req.query.jobType || "";
                const salary = req.query.salary || "";
                const id = req.query.id || "";
                const skill = req.query.skill || "";
                const active = req.query.active !== undefined ? req.query.active === 'true' : undefined;
                const expiredBefore = req.query.expiredBefore
                    ? new Date(req.query.expiredBefore)
                    : undefined;
                const { jobs, totalJobs } = yield this._employeeService.getAllJobs(page, pageSize, query, id, // user ID
                location, jobType, salary, skill, active, expiredBefore);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    jobs,
                    totalJobs,
                    totalPages: Math.ceil(totalJobs / pageSize),
                    currentPage: page,
                });
            }
            catch (error) {
                const err = error;
                console.error('Error fetching jobs:', err.message);
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    getRecentJobs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const response = yield this._employeeService.getRecentJobs(id);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    jobs: response
                });
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
                console.log('Error:', err.message);
            }
        });
    }
    editJob(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const payload = req.body;
                yield this._employeeService.editJob(id, payload);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    message: constants_1.JobPost.JOB_UPDATED
                });
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    getJob(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const job = yield this._employeeService.getJob(payload);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    job: job,
                });
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    getJobs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 10;
                const query = req.query.querys || "";
                const location = req.query.location || "";
                const jobType = req.query.jobType || "";
                const salary = req.query.salary || "";
                const { jobs, totalJobs } = yield this._employeeService.getJobs(id, page, pageSize, query, location, jobType, salary);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    jobs: jobs,
                    totalJobs,
                    totalPages: Math.ceil(totalJobs / pageSize),
                    currentPage: page,
                });
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    getAllEmployees(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 10;
                const query = req.query.querys || "";
                const location = req.query.location || "";
                const omit = req.query.omit || "";
                const { employees, totalEmployees } = yield this._employeeService.getAllEmployees(page, pageSize, query, location, omit);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    employees,
                    totalEmployees,
                    totalPages: Math.ceil(totalEmployees / pageSize),
                    currentPage: page,
                });
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    toggleStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const status = req.body.status;
                console.log('...............', status);
                const response = yield this._employeeService.toggleStatus(id, status);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    message: status ? constants_1.JobPost.JOB_REMOVED : constants_1.JobPost.JOB_RECOVERD
                });
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    getEmployeeDetail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const response = yield this._employeeService.getEmployeeDetail(id);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    employee: response
                });
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    getStatistics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const response = yield this._employeeService.getStatistics(id);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    result: response
                });
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
}
exports.EmployeeController = EmployeeController;
