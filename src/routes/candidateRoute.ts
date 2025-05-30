import { Request, Response, Router } from "express";
import upload from "../utils/upload";
import { candidateController } from "../config/dependencyInjector";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Roles } from "../utils/enums";

const router = Router();

router.put(
    '/:id/profile',
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'banner', maxCount: 1 },
        { name: 'resume', maxCount: 1 }
    ]), authMiddleware([Roles.CANDIDATE]), candidateController.updateOrCreate.bind(candidateController)
);

router.post('/get/profile', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), candidateController.getCandidateProfile.bind(candidateController));


router.get('/all', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), candidateController.getAllCandidates.bind(candidateController))

router.post('/save/job', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), candidateController.saveJob.bind(candidateController))

router.get('/remove/save/job/:id', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), candidateController.removeSavedJob.bind(candidateController))

router.get('/get/saved/jobs', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), candidateController.getAllSavedJobs.bind(candidateController))

router.get('/get/statistics/:id', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), candidateController.getStatistics.bind(candidateController))

router.get('/get/connected/users/:id', authMiddleware([Roles.CANDIDATE]), candidateController.getConnectedUsers.bind(candidateController))

router.post('/message', upload.fields([{ name: 'images', maxCount: 5 }]), authMiddleware([Roles.CANDIDATE]), candidateController.messageTo.bind(candidateController))

router.post('/get/messages', authMiddleware([Roles.CANDIDATE]), candidateController.getMessages.bind(candidateController))

router.get('/get/unSeen/:id', authMiddleware([Roles.CANDIDATE]), candidateController.getUnSeenMessageCount.bind(candidateController))

router.get('/delete/message/:id', authMiddleware([Roles.CANDIDATE]), candidateController.removeMessage.bind(candidateController))

router.get('/update/seen/:id', authMiddleware([Roles.CANDIDATE]), candidateController.updateSeen.bind(candidateController))

router.put('/update/edit', authMiddleware([Roles.CANDIDATE]), candidateController.updateEditMessage.bind(candidateController))

const candidateRoutes = router;
export default candidateRoutes;
