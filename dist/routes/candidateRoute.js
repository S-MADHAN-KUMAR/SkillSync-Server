"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = __importDefault(require("../utils/upload"));
const dependencyInjector_1 = require("../config/dependencyInjector");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const enums_1 = require("../utils/enums");
const router = (0, express_1.Router)();
router.put('/:id/profile', upload_1.default.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
]), (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE]), dependencyInjector_1.candidateController.updateOrCreate.bind(dependencyInjector_1.candidateController));
router.post('/get/profile', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.candidateController.getCandidateProfile.bind(dependencyInjector_1.candidateController));
router.get('/all', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.candidateController.getAllCandidates.bind(dependencyInjector_1.candidateController));
router.post('/save/job', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.candidateController.saveJob.bind(dependencyInjector_1.candidateController));
router.get('/remove/save/job/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.candidateController.removeSavedJob.bind(dependencyInjector_1.candidateController));
router.get('/get/saved/jobs', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.candidateController.getAllSavedJobs.bind(dependencyInjector_1.candidateController));
router.get('/get/statistics/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.candidateController.getStatistics.bind(dependencyInjector_1.candidateController));
router.get('/get/connected/users/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE]), dependencyInjector_1.candidateController.getConnectedUsers.bind(dependencyInjector_1.candidateController));
router.post('/message', upload_1.default.fields([{ name: 'images', maxCount: 5 }]), (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE]), dependencyInjector_1.candidateController.messageTo.bind(dependencyInjector_1.candidateController));
router.post('/get/messages', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE]), dependencyInjector_1.candidateController.getMessages.bind(dependencyInjector_1.candidateController));
router.get('/get/unSeen/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE]), dependencyInjector_1.candidateController.getUnSeenMessageCount.bind(dependencyInjector_1.candidateController));
router.get('/delete/message/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE]), dependencyInjector_1.candidateController.removeMessage.bind(dependencyInjector_1.candidateController));
router.get('/update/seen/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE]), dependencyInjector_1.candidateController.updateSeen.bind(dependencyInjector_1.candidateController));
router.put('/update/edit', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE]), dependencyInjector_1.candidateController.updateEditMessage.bind(dependencyInjector_1.candidateController));
const candidateRoutes = router;
exports.default = candidateRoutes;
