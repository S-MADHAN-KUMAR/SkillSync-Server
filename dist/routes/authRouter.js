"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dependencyInjector_1 = require("../config/dependencyInjector");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const enums_1 = require("../utils/enums");
const router = (0, express_1.Router)();
// Authentication
router.post('/register', dependencyInjector_1.userController.register.bind(dependencyInjector_1.userController));
router.post('/login', dependencyInjector_1.userController.login.bind(dependencyInjector_1.userController));
router.post('/google', dependencyInjector_1.userController.googleAuth.bind(dependencyInjector_1.userController));
router.post('/logout/:role', dependencyInjector_1.userController.logout.bind(dependencyInjector_1.userController));
router.post('/refresh-token', dependencyInjector_1.userController.refreshToken.bind(dependencyInjector_1.userController));
// OTP & Password Recovery
router.post('/otp/verify', dependencyInjector_1.userController.otpVerify.bind(dependencyInjector_1.userController));
router.get('/otp/resend/:email', dependencyInjector_1.userController.resetOtp.bind(dependencyInjector_1.userController));
router.get('/otp/forgot/:email', dependencyInjector_1.userController.forgotEmail.bind(dependencyInjector_1.userController));
router.post('/otp/forgot/verify', dependencyInjector_1.userController.forgotOtpVerify.bind(dependencyInjector_1.userController));
router.post('/password/reset', dependencyInjector_1.userController.resetPassword.bind(dependencyInjector_1.userController));
// Users
router.get('/users/email/:email', dependencyInjector_1.userController.getUserWithEmail.bind(dependencyInjector_1.userController));
//Save candidate
router.post('/save/candidate', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.EMPLOYEE, enums_1.Roles.CANDIDATE]), dependencyInjector_1.userController.saveCandidate.bind(dependencyInjector_1.userController));
router.get('/remove/save/candidate/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.EMPLOYEE, enums_1.Roles.CANDIDATE]), dependencyInjector_1.userController.removeSavedCandidate.bind(dependencyInjector_1.userController));
router.get('/get/savedCandidates', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.EMPLOYEE, enums_1.Roles.CANDIDATE]), dependencyInjector_1.userController.getSavedCandidates.bind(dependencyInjector_1.userController));
const userRoutes = router;
exports.default = userRoutes;
