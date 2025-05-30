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
exports.AdminController = void 0;
const enums_1 = require("../../utils/enums");
const constants_1 = require("../../utils/constants");
const generateTokens_1 = require("../../utils/generateTokens");
class AdminController {
    constructor(_admineService, _userService, _postService) {
        this._admineService = _admineService;
        this._userService = _userService;
        this._postService = _postService;
    }
    adminLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const response = yield this._admineService.adminLogin(payload);
                const tokens = (0, generateTokens_1.generateTokens)({
                    role: enums_1.Roles.ADMIN
                });
                res
                    .cookie('adminToken', tokens.accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 15 * 60 * 1000, // 15 minutes
                })
                    .cookie('refreshToken', tokens.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    message: constants_1.AdminSuccessMessages.ADMIN_LOGGED_IN,
                    response,
                    token: tokens.accessToken
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
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.clearCookie(`adminToken`, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });
            res.status(enums_1.StatusCode.OK).json({
                success: true,
                message: 'Logged out successfully',
            });
        });
    }
    getCandidates(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = Number(req.query.page) || 1;
                const pageSize = Number(req.query.pageSize) || 10;
                const querys = req.query.querys || "";
                const { candidates, totalCandidates } = yield this._userService.getAllCandidates(page, pageSize, querys);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    users: candidates,
                    totalCandidates,
                    totalPages: Math.ceil(totalCandidates / pageSize),
                    currentPage: page
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
    getEmployees(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = Number(req.query.page) || 1;
                const pageSize = Number(req.query.pageSize) || 10;
                const querys = req.query.querys || "";
                const { employees, totalEmployees } = yield this._userService.getAllEmployees(page, pageSize, querys);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    users: employees,
                    totalEmployees,
                    totalPages: Math.ceil(totalEmployees / pageSize),
                    currentPage: page
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
    getPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = Number(req.query.page) || 1;
                const pageSize = Number(req.query.pageSize) || 10;
                const querys = req.query.querys || "";
                const userId = req.query.userId || "";
                const role = req.query.role || "";
                const { posts, totalPosts } = yield this._admineService.getPosts(page, pageSize, querys, userId, role);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    posts: posts,
                    totalPosts,
                    totalPages: totalPosts && Math.ceil(totalPosts / pageSize),
                    currentPage: page
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
                let payload = req.body;
                const response = yield this._userService.toggleStatus(payload);
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        response,
                        message: payload.status === true ? constants_1.UserSuccessMessages.USER_BLOCKED : constants_1.UserSuccessMessages.USER_UNBLOCKED,
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
    togglePostStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let payload = req.body;
                console.log('payload', payload);
                const response = yield this._postService.togglePostStatus(payload === null || payload === void 0 ? void 0 : payload.status, payload === null || payload === void 0 ? void 0 : payload.id);
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        message: payload.status === true ? constants_1.PostErrorMessages.POST_BLOCKED : constants_1.PostErrorMessages.POST_UNBLOCKED,
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
    toggleAiAccessStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let payload = req.body;
                const response = yield this._userService.togglePostStatus({ status: payload === null || payload === void 0 ? void 0 : payload.status, id: payload === null || payload === void 0 ? void 0 : payload.id });
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        message: payload.status ? constants_1.AiAccessErrorMessages.ACCESS_UNBLOCKED : constants_1.AiAccessErrorMessages.ACCESS_BLOCKED,
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
    getStatistics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this._admineService.getStatistics();
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        response
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
}
exports.AdminController = AdminController;
