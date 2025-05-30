import { Router } from "express";
import { notificationsController } from "../config/dependencyInjector";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Roles } from "../utils/enums";

const router = Router();

router.get('/get/:id', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), notificationsController.getUserNotifications.bind(notificationsController))

router.get('/update/read/:id', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), notificationsController.updateRead.bind(notificationsController))

router.post('/send/interview/notification', authMiddleware([Roles.EMPLOYEE]), notificationsController.sendInterviewNotification.bind(notificationsController))

const notificationRoutes = router;
export default notificationRoutes;
