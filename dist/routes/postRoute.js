"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dependencyInjector_1 = require("../config/dependencyInjector");
const upload_1 = __importDefault(require("../utils/upload"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const enums_1 = require("../utils/enums");
const router = (0, express_1.Router)();
router.post('/create/:id', upload_1.default.fields([
    { name: 'images', maxCount: 5 }
]), (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.postController.createPost.bind(dependencyInjector_1.postController));
router.get('/recent/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.postController.getRecentPosts.bind(dependencyInjector_1.postController));
router.post('/get/all', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.postController.getAllPosts.bind(dependencyInjector_1.postController));
router.get('/get/user', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.postController.getUserPosts.bind(dependencyInjector_1.postController));
router.get('/get/post/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.postController.getPost.bind(dependencyInjector_1.postController));
router.post('/update/post/:id', upload_1.default.fields([
    { name: 'images', maxCount: 5 }
]), (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.postController.updatePost.bind(dependencyInjector_1.postController));
router.put('/update/status/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.postController.toggleStatus.bind(dependencyInjector_1.postController));
router.put('/like/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.postController.likePost.bind(dependencyInjector_1.postController));
router.post('/comment/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.postController.commentpost.bind(dependencyInjector_1.postController));
router.post('/reply/comment/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.postController.replyComment.bind(dependencyInjector_1.postController));
router.put('/nested/reply/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.postController.nestesReply.bind(dependencyInjector_1.postController));
router.post('/get/replies', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.postController.getReplies.bind(dependencyInjector_1.postController));
router.get('/remove/comment/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.postController.removeComment.bind(dependencyInjector_1.postController));
router.get('/remove/reply/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.postController.removeReply.bind(dependencyInjector_1.postController));
router.get('/remove/nested/reply/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.postController.removeNestedReply.bind(dependencyInjector_1.postController));
router.get('/get/user/posts', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.postController.getUserAllPosts.bind(dependencyInjector_1.postController));
router.post('/save/post', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.postController.savePost.bind(dependencyInjector_1.postController));
router.get('/remove/save/post/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.postController.removeSavedPost.bind(dependencyInjector_1.postController));
router.get('/get/savedPosts', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.postController.getAllSavedPosts.bind(dependencyInjector_1.postController));
const postRoutes = router;
exports.default = postRoutes;
