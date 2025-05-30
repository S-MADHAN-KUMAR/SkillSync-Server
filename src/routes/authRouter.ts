import { Router } from "express";
import { userController } from "../config/dependencyInjector";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Roles } from "../utils/enums";

const router = Router();

// Authentication
router.post('/register', userController.register.bind(userController));
router.post('/login', userController.login.bind(userController));
router.post('/google', userController.googleAuth.bind(userController));
router.post('/logout/:role', userController.logout.bind(userController))
router.post('/refresh-token', userController.refreshToken.bind(userController));

// OTP & Password Recovery
router.post('/otp/verify', userController.otpVerify.bind(userController));
router.get('/otp/resend/:email', userController.resetOtp.bind(userController));
router.get('/otp/forgot/:email', userController.forgotEmail.bind(userController));
router.post('/otp/forgot/verify', userController.forgotOtpVerify.bind(userController));
router.post('/password/reset', userController.resetPassword.bind(userController));

// Users
router.get('/users/email/:email', userController.getUserWithEmail.bind(userController));

//Save candidate

router.post('/save/candidate', authMiddleware([Roles.EMPLOYEE, Roles.CANDIDATE]), userController.saveCandidate.bind(userController));

router.get('/remove/save/candidate/:id', authMiddleware([Roles.EMPLOYEE, Roles.CANDIDATE]), userController.removeSavedCandidate.bind(userController));

router.get('/get/savedCandidates', authMiddleware([Roles.EMPLOYEE, Roles.CANDIDATE]), userController.getSavedCandidates.bind(userController));

const userRoutes = router;
export default userRoutes;
