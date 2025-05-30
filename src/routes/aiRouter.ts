import { Router } from "express";
import { aiController } from "../config/dependencyInjector";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Roles } from "../utils/enums";

const router = Router();

//Candidate

router.post('/mockInterview/:id', authMiddleware([Roles.CANDIDATE]), aiController.createMockInterview.bind(aiController))
router.post('/saveAnswer/:id', authMiddleware([Roles.CANDIDATE]), aiController.saveAnswer.bind(aiController))
router.get('/get/:id', authMiddleware([Roles.CANDIDATE]), aiController.getMockInterview.bind(aiController))
router.get('/getAll', authMiddleware([Roles.CANDIDATE]), aiController.getAllMockInterviews.bind(aiController))
router.get('/ai-access/:id', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), aiController.checkAiAccess.bind(aiController));
router.put('/remove/interview', authMiddleware([Roles.CANDIDATE]), aiController.removeInterview.bind(aiController));

//Employee
router.post('/employee/interview/:employeeId', authMiddleware([Roles.EMPLOYEE]), aiController.createInterview.bind(aiController))
router.get('/employee/getAll', authMiddleware([Roles.EMPLOYEE]), aiController.getAllVoiceInterviews.bind(aiController))
router.get('/getAll/candidates', authMiddleware([Roles.EMPLOYEE]), aiController.getAllCandidates.bind(aiController))

router.get('/get/interview/:id', authMiddleware([Roles.EMPLOYEE, Roles.CANDIDATE]), aiController.getInterview.bind(aiController))

router.post('/check/access', authMiddleware([Roles.CANDIDATE]), aiController.checkInterviewAccess.bind(aiController))

router.post('/answer', authMiddleware([Roles.CANDIDATE]), aiController.askAnswer.bind(aiController))

router.get('/get/feedback/:id', authMiddleware([Roles.EMPLOYEE, Roles.CANDIDATE]), aiController.getFeedback.bind(aiController))

router.get('/remove/interview/:id', authMiddleware([Roles.EMPLOYEE, Roles.CANDIDATE]), aiController.removeVoiceInterview.bind(aiController))

const aiRouter = router;
export default aiRouter;