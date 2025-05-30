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
exports.CandidateController = void 0;
const enums_1 = require("../../utils/enums");
const constants_1 = require("../../utils/constants");
const uploadToCloudinary_1 = require("../../utils/uploadToCloudinary");
class CandidateController {
    constructor(_candidateService) {
        this._candidateService = _candidateService;
    }
    updateOrCreate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const id = req.params.id;
                const files = req.files;
                let logoUrl = '';
                let bannerUrl = '';
                let resumeUrl = '';
                if (files.logo && files.logo[0]) {
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
                if (files.banner && files.banner[0]) {
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
                if (files.resume && files.resume[0]) {
                    const resumeFile = files.resume[0];
                    if (resumeFile.mimetype.startsWith('image/')) {
                        resumeUrl = yield (0, uploadToCloudinary_1.uploadFileToCloudinary)(resumeFile.buffer, 'image', 'resume_images');
                    }
                    else if (resumeFile.mimetype === 'application/pdf') {
                        resumeUrl = yield (0, uploadToCloudinary_1.uploadFileToCloudinary)(resumeFile.buffer, 'pdf', 'pdf_files');
                    }
                    else {
                        throw new Error('Invalid file type for resume. Only image or PDF is allowed.');
                    }
                }
                if (payload.logo && !logoUrl) {
                    logoUrl = payload.logo;
                }
                if (payload.banner && !bannerUrl) {
                    bannerUrl = payload.banner;
                }
                if (payload.resume && !resumeUrl) {
                    resumeUrl = payload.resume;
                }
                payload.logo = logoUrl;
                payload.banner = bannerUrl;
                payload.resume = resumeUrl;
                payload.userId = id;
                const { response, user } = yield this._candidateService.updateOrCreate(payload, id);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    message: constants_1.UserSuccessMessages.USER_CREATED,
                    user
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
    getCandidateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                console.log(payload);
                const response = yield this._candidateService.getCandidateProfile(payload);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    candidate: response,
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
    getAllCandidates(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 10;
                const query = req.query.querys || "";
                const location = req.query.location || "";
                const omit = req.query.omit || "";
                const userId = req.query.userId || "";
                const { candidates, totalCandidates } = yield this._candidateService.getAllCandidates(page, pageSize, query, location, omit, userId);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    candidates: candidates,
                    totalCandidates,
                    totalPages: Math.ceil(totalCandidates / pageSize),
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
    getAllSavedJobs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 10;
                const querys = req.query.querys || "";
                const id = req.query.id || "";
                const response = yield this._candidateService.getAllSavedJobs({
                    page,
                    pageSize,
                    querys,
                    id
                });
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        jobs: response === null || response === void 0 ? void 0 : response.jobs,
                        totalJobs: response === null || response === void 0 ? void 0 : response.totalJobs,
                        totalPages: (response === null || response === void 0 ? void 0 : response.totalJobs) && Math.ceil((response === null || response === void 0 ? void 0 : response.totalJobs) / pageSize),
                    });
                }
                else {
                    res.status(enums_1.StatusCode.OK).json({
                        success: false,
                        message: "Failed to get saved job posts"
                    });
                }
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
    saveJob(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const response = yield this._candidateService.saveJob(payload);
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        message: "Job Post Saved"
                    });
                }
                else {
                    res.status(enums_1.StatusCode.OK).json({
                        success: false,
                        message: "Failed to save"
                    });
                }
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
    removeSavedJob(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const response = yield this._candidateService.removeSaveJob(id);
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        message: "Job Post Removed"
                    });
                }
                else {
                    res.status(enums_1.StatusCode.OK).json({
                        success: false,
                        message: "Failed to remove job post"
                    });
                }
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
    getStatistics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const response = yield this._candidateService.getStatistics(id);
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        response
                    });
                }
                else {
                    res.status(enums_1.StatusCode.OK).json({
                        success: false,
                        message: "Failed to get"
                    });
                }
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
    getConnectedUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const connectedUsers = yield this._candidateService.getConnectedUsers(id);
                if (connectedUsers) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        connectedUsers,
                    });
                }
                else {
                    res.status(enums_1.StatusCode.NOT_FOUND).json({
                        success: false,
                        message: "No connected candidates found.",
                    });
                }
            }
            catch (error) {
                console.error("Error in getConnectedUsers:", error.message);
                res.status(enums_1.StatusCode.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: "Failed to retrieve connected users.",
                });
            }
        });
    }
    messageTo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const files = req.files;
                let imageUrls = [];
                // Handle image files from multipart/form-data
                if (files === null || files === void 0 ? void 0 : files.images) {
                    for (const file of files.images) {
                        if (file.mimetype.startsWith('image/')) {
                            const url = yield (0, uploadToCloudinary_1.uploadFileToCloudinary)(file.buffer, 'image', 'message_images');
                            imageUrls.push(url);
                        }
                        else {
                            res.status(enums_1.StatusCode.BAD_REQUEST).json({
                                success: false,
                                message: 'Only image files are allowed in the "images" field.'
                            });
                        }
                    }
                }
                // If frontend also sends image URLs in body (e.g., from another source)
                if (payload.images) {
                    const parsedUrls = typeof payload.images === 'string'
                        ? JSON.parse(payload.images)
                        : payload.images;
                    imageUrls = [...imageUrls, ...parsedUrls];
                }
                const response = yield this._candidateService.messageTo({
                    senderId: payload.senderId,
                    recipientId: payload.recipientId,
                    content: payload.content,
                    imageUrls
                });
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({ success: true });
                }
                else {
                    res.status(enums_1.StatusCode.INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: "Failed to send message!"
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
                console.error('❌ Error sending message:', err.message);
            }
        });
    }
    getMessages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { senderId, recipientId } = req.body;
                if (!senderId || !recipientId) {
                    res.status(enums_1.StatusCode.BAD_REQUEST).json({
                        success: false,
                        message: "Both senderId and recipientId are required."
                    });
                }
                const messages = yield this._candidateService.getMessages({ senderId, recipientId });
                if (messages) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        messages
                    });
                }
                else {
                    res.status(enums_1.StatusCode.NOT_FOUND).json({
                        success: false,
                        message: "No messages found."
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: err.message,
                });
                console.error('❌ Error fetching messages:', err.message);
            }
        });
    }
    getUnSeenMessageCount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const messages = yield this._candidateService.getUnSeenMessageCount(id);
                if (messages) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        count: messages
                    });
                }
                else {
                    res.status(enums_1.StatusCode.NOT_FOUND).json({
                        success: false,
                        message: "No messages found."
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: err.message,
                });
                console.error('❌ Error fetching messages:', err.message);
            }
        });
    }
    removeMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const messages = yield this._candidateService.removeMessage(id);
                if (messages) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        message: "Message removed!"
                    });
                }
                else {
                    res.status(enums_1.StatusCode.NOT_FOUND).json({
                        success: false,
                        message: "No messages found."
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: err.message,
                });
                console.error('❌ Error fetching messages:', err.message);
            }
        });
    }
    updateSeen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const messages = yield this._candidateService.updateSeen(id);
                if (messages) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true
                    });
                }
                else {
                    res.status(enums_1.StatusCode.NOT_FOUND).json({
                        success: false,
                        message: "No messages found."
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: err.message,
                });
                console.error('❌ Error fetching messages:', err.message);
            }
        });
    }
    updateEditMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const messages = yield this._candidateService.updateEditMessage(payload);
                if (messages) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true
                    });
                }
                else {
                    res.status(enums_1.StatusCode.NOT_FOUND).json({
                        success: false,
                        message: "No messages found."
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: err.message,
                });
                console.error('❌ Error fetching messages:', err.message);
            }
        });
    }
}
exports.CandidateController = CandidateController;
