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
exports.PostController = void 0;
const enums_1 = require("../../utils/enums");
const constants_1 = require("../../utils/constants");
const uploadToCloudinary_1 = require("../../utils/uploadToCloudinary");
class PostController {
    constructor(_postService) {
        this._postService = _postService;
    }
    createPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const id = req.params.id;
                const files = req.files;
                let imageUrls = [];
                if (files && files.images) {
                    for (const file of files.images) {
                        if (file.mimetype.startsWith('image/')) {
                            const url = yield (0, uploadToCloudinary_1.uploadFileToCloudinary)(file.buffer, 'image', 'post_images');
                            imageUrls.push(url);
                        }
                        else {
                            throw new Error('Only image files are allowed in images field.');
                        }
                    }
                }
                // Fallback if frontend also sends image URLs in body
                if (payload.imageUrls) {
                    const parsed = typeof payload.imageUrls === 'string' ? JSON.parse(payload.imageUrls) : payload.imageUrls;
                    imageUrls = [...imageUrls, ...parsed];
                }
                payload.imageUrls = imageUrls;
                const response = yield this._postService.createPost(payload, id);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    message: constants_1.PostSuccessMsg.CREATED,
                    post: response,
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
    getRecentPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const response = yield this._postService.getRecentPosts(id);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    posts: response
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
    getAllPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const response = yield this._postService.getAllPosts(payload);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    posts: response
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
    getUserPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 10;
                const query = req.query.querys || "";
                const userId = req.query.userId || "";
                const { posts, totalPosts } = yield this._postService.getUserPosts(page, pageSize, query, userId);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    posts,
                    totalPosts
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
    getPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const response = yield this._postService.getPost(id);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    post: response
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
    updatePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const id = req.params.id;
                const files = req.files;
                console.log('files:', files);
                let imageUrls = [];
                if (files && files.images) {
                    for (const file of files.images) {
                        if (file.mimetype.startsWith('image/')) {
                            const url = yield (0, uploadToCloudinary_1.uploadFileToCloudinary)(file.buffer, 'image', 'post_images');
                            imageUrls.push(url);
                        }
                        else {
                            throw new Error('Only image files are allowed in images field.');
                        }
                    }
                }
                // Fallback if frontend also sends image URLs in body
                if (payload.imageUrls) {
                    const parsed = typeof payload.imageUrls === 'string' ? JSON.parse(payload.imageUrls) : payload.imageUrls;
                    imageUrls = [...imageUrls, ...parsed];
                }
                payload.imageUrls = imageUrls.length > 0 ? imageUrls : payload.images;
                console.log(payload);
                const response = yield this._postService.updatePost(payload, id);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    message: 'Post Updated',
                    post: response
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
    toggleStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const status = req.body.status;
                const id = req.params.id;
                const response = yield this._postService.toggleStatus(status, id);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    message: status === true ? "Post Recoverd" : "Post Removed",
                    post: response
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
    likePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const id = req.params.id;
                const response = yield this._postService.likePost(id, payload === null || payload === void 0 ? void 0 : payload.postId);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    post: response
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
    commentpost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const id = req.params.id;
                const response = yield this._postService.commentpost(id, payload);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    post: response
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
    replyComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const id = req.params.id;
                const response = yield this._postService.replyComment(id, payload);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    post: response
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
    nestesReply(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const id = req.params.id;
                const response = yield this._postService.nestesReply(id, payload);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    post: response
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
    getReplies(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const response = yield this._postService.getReplies(payload);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    replies: response
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
    removeComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const response = yield this._postService.removeComment(id);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    replies: response
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
    removeReply(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const response = yield this._postService.removeReply(id);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    replies: response
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
    removeNestedReply(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const response = yield this._postService.removeNestedReply(id);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    replies: response
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
    getUserAllPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 10;
                const id = req.query.id || "";
                const role = req.query.role || "";
                const userId = req.query.userId || "";
                const { posts, totalPosts } = yield this._postService.getUserAllPosts(page, pageSize, id, userId, role);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    posts,
                    totalPosts,
                    totalPages: totalPosts && Math.ceil(totalPosts / pageSize),
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
    savePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const response = yield this._postService.savePost(payload);
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        message: "Post Saved"
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
    removeSavedPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const response = yield this._postService.removeSavePost(id);
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        message: "Post Removed"
                    });
                }
                else {
                    res.status(enums_1.StatusCode.OK).json({
                        success: false,
                        message: "Failed to remove post"
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
    getAllSavedPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 10;
                const querys = req.query.querys || "";
                const userId = req.query.id || "";
                const role = req.query.role || "";
                const { posts, totalPosts } = yield this._postService.getAllSavedPosts(page, pageSize, userId, querys, role);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    posts,
                    totalPosts,
                    totalPages: totalPosts && Math.ceil(totalPosts / pageSize),
                });
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: err.message,
                });
                console.log("Error fetching saved posts:", err.message);
            }
        });
    }
}
exports.PostController = PostController;
