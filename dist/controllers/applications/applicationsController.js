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
exports.ApplicationsController = void 0;
const enums_1 = require("../../utils/enums");
class ApplicationsController {
    constructor(_applicationsService) {
        this._applicationsService = _applicationsService;
    }
    apply(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const response = yield this._applicationsService.apply(payload);
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        message: "Applied Successfully!"
                    });
                }
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
    updateApplicationStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const response = yield this._applicationsService.updateApplicationStatus(payload);
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        message: "Applied Updated!"
                    });
                }
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
    getAllApplications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 10;
                const querys = req.query.querys || "";
                const jobId = req.query.jobId || "";
                const response = yield this._applicationsService.getAllApplications({
                    page,
                    pageSize,
                    query: querys,
                    jobId
                });
                if (!response) {
                    res.status(enums_1.StatusCode.NOT_FOUND).json({
                        success: false,
                        message: "Job post not found.",
                    });
                    return;
                }
                const { applications, totalPages } = response;
                if (applications.length === 0) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        message: "No applications found for this job.",
                        applications: [],
                        totalPages: 0,
                    });
                    return;
                }
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    applications,
                    totalPages,
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
    getUserApplications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 10;
                const querys = req.query.querys || "";
                const userId = req.query.userId || "";
                const response = yield this._applicationsService.getUserApplications({
                    page,
                    pageSize,
                    query: querys,
                    userId
                });
                if (!response) {
                    res.status(enums_1.StatusCode.NOT_FOUND).json({
                        success: false,
                        message: "Job post not found.",
                    });
                    return;
                }
                const { applications, totalPages } = response;
                if (applications.length === 0) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        message: "No applications found for this job.",
                        applications: [],
                        totalPages: 0,
                    });
                    return;
                }
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    applications,
                    totalPages,
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
exports.ApplicationsController = ApplicationsController;
