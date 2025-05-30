import { Router } from "express";
import { followController } from "../config/dependencyInjector";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Roles } from "../utils/enums";

const router = Router();

router.post('/request', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), followController.request.bind(followController))
router.post('/accept', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), followController.accept.bind(followController))
router.post('/cancel', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), followController.cancel.bind(followController))
router.post('/unfollow', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), followController.unfollow.bind(followController))
// router.post('/update/:id', followController.update.bind(followController))

const followRoutes = router;
export default followRoutes;
