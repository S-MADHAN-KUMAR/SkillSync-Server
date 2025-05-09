import { Router } from "express";
import { aiController } from "../config/dependencyInjector";

const router = Router();

router.post('/mockInterview/:id', aiController.createMockInterview.bind(aiController))
router.post('/saveAnswer/:id', aiController.saveAnswer.bind(aiController))
router.get('/get/:id', aiController.getMockInterview.bind(aiController))
router.get('/getAll/:id', aiController.getAllMockInterviews.bind(aiController))

const aiRouter = router;
export default aiRouter;