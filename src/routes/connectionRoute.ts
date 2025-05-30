import { Router } from "express";
import { connectionsController } from "../config/dependencyInjector";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Roles } from "../utils/enums";

const router = Router();

router.post('/request', authMiddleware([Roles.CANDIDATE]), connectionsController.request.bind(connectionsController))
router.post('/accept', authMiddleware([Roles.CANDIDATE]), connectionsController.accept.bind(connectionsController))
router.post('/cancel', authMiddleware([Roles.CANDIDATE]), connectionsController.cancel.bind(connectionsController))
router.post('/disconnect', authMiddleware([Roles.CANDIDATE]), connectionsController.disconnect.bind(connectionsController))
router.post('/update/:id', authMiddleware([Roles.CANDIDATE]), connectionsController.update.bind(connectionsController))

const connectionRoutes = router;
export default connectionRoutes;
