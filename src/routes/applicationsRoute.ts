import { Request, Response, Router } from "express";
import { applicationsController } from "../config/dependencyInjector";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Roles } from "../utils/enums";

const router = Router();

router.post('/apply', authMiddleware([Roles.CANDIDATE]), applicationsController.apply.bind(applicationsController))

router.get('/get/all/applications', authMiddleware([Roles.EMPLOYEE]), applicationsController.getAllApplications.bind(applicationsController))

router.get('/get/user/applications', authMiddleware([Roles.CANDIDATE]), applicationsController.getUserApplications.bind(applicationsController))

router.post('/update/status', authMiddleware([Roles.EMPLOYEE]), applicationsController.updateApplicationStatus.bind(applicationsController))

const applicationsRoutes = router;
export default applicationsRoutes;
