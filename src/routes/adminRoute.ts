import { Request, Response, Router } from "express";
import { adminController } from "../config/dependencyInjector";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Roles } from "../utils/enums";

const router = Router();

router.post('/login', adminController.adminLogin.bind(adminController));

router.post('/logout', adminController.logout.bind(adminController));

router.get('/candidates', authMiddleware([Roles.ADMIN]), adminController.getCandidates.bind(adminController));

router.get('/employees', authMiddleware([Roles.ADMIN]), adminController.getEmployees.bind(adminController));

router.get('/posts', adminController.getPosts.bind(adminController));

router.put('/users/status', authMiddleware([Roles.ADMIN]), adminController.toggleStatus.bind(adminController));

router.put('/posts/status', authMiddleware([Roles.ADMIN]), adminController.togglePostStatus.bind(adminController));

router.put('/ai/access/status', authMiddleware([Roles.ADMIN]), adminController.toggleAiAccessStatus.bind(adminController));

router.get('/get/statistics', authMiddleware([Roles.ADMIN]), adminController.getStatistics.bind(adminController));

const adminRoutes = router;
export default adminRoutes;
