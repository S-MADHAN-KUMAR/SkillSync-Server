import { Request, Response, Router } from "express";
import upload from "../utils/upload";
import { candidateController } from "../config/dependencyInjector";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.put(
    '/:id/profile',
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'banner', maxCount: 1 },
        { name: 'resume', maxCount: 1 }
    ]), authMiddleware(['candidate']), candidateController.updateOrCreate.bind(candidateController)
);

router.get(
    '/get/:id/profile', authMiddleware(['candidate']), candidateController.getCandidateProfile.bind(candidateController)
);


const candidateRoutes = router;
export default candidateRoutes;
