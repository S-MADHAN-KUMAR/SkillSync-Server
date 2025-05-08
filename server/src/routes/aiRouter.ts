import { Router } from "express";
import { aiController } from "../config/dependencyInjector";

const router = Router();

router.post('/mockInterview/:id', aiController.createMockInterview.bind(aiController))
router.get('/get/:id', aiController.getMockInterview.bind(aiController))

const aiRouter = router;
export default aiRouter;