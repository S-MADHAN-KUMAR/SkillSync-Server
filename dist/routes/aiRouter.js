"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dependencyInjector_1 = require("../config/dependencyInjector");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const enums_1 = require("../utils/enums");
const router = (0, express_1.Router)();
//Candidate
router.post('/mockInterview/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE]), dependencyInjector_1.aiController.createMockInterview.bind(dependencyInjector_1.aiController));
router.post('/saveAnswer/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE]), dependencyInjector_1.aiController.saveAnswer.bind(dependencyInjector_1.aiController));
router.get('/get/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE]), dependencyInjector_1.aiController.getMockInterview.bind(dependencyInjector_1.aiController));
router.get('/getAll', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE]), dependencyInjector_1.aiController.getAllMockInterviews.bind(dependencyInjector_1.aiController));
router.get('/ai-access/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.aiController.checkAiAccess.bind(dependencyInjector_1.aiController));
router.put('/remove/interview', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE]), dependencyInjector_1.aiController.removeInterview.bind(dependencyInjector_1.aiController));
//Employee
router.post('/employee/interview/:employeeId', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.EMPLOYEE]), dependencyInjector_1.aiController.createInterview.bind(dependencyInjector_1.aiController));
router.get('/employee/getAll', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.EMPLOYEE]), dependencyInjector_1.aiController.getAllVoiceInterviews.bind(dependencyInjector_1.aiController));
router.get('/getAll/candidates', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.EMPLOYEE]), dependencyInjector_1.aiController.getAllCandidates.bind(dependencyInjector_1.aiController));
router.get('/get/interview/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.EMPLOYEE, enums_1.Roles.CANDIDATE]), dependencyInjector_1.aiController.getInterview.bind(dependencyInjector_1.aiController));
router.post('/check/access', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE]), dependencyInjector_1.aiController.checkInterviewAccess.bind(dependencyInjector_1.aiController));
router.post('/answer', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE]), dependencyInjector_1.aiController.askAnswer.bind(dependencyInjector_1.aiController));
router.get('/get/feedback/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.EMPLOYEE, enums_1.Roles.CANDIDATE]), dependencyInjector_1.aiController.getFeedback.bind(dependencyInjector_1.aiController));
router.get('/remove/interview/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.EMPLOYEE, enums_1.Roles.CANDIDATE]), dependencyInjector_1.aiController.removeVoiceInterview.bind(dependencyInjector_1.aiController));
const aiRouter = router;
exports.default = aiRouter;
