import { Request, Response, Router } from "express";
import upload from "../utils/upload";
import { candidateController } from "../config/dependencyInjector";

const router = Router();

// Update or create candidate profile (PUT for update)
router.put(
    '/candidates/:id/profile',
    upload.fields([
        { name: 'profile', maxCount: 1 },
        { name: 'banner', maxCount: 1 },
        { name: 'resume', maxCount: 1 }
    ]),
    candidateController.updateOrCreate.bind(candidateController)
);

// Get candidate profile
router.get(
    '/candidates/:id/profile',
    candidateController.getCandidateProfile.bind(candidateController)
);

const candidateRoutes = router;
export default candidateRoutes;
