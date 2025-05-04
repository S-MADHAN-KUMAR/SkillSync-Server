import { Request, Response, Router } from "express";
import upload from "../utils/upload";
import { employeeController } from "../config/dependencyInjector";

const router = Router();

// Employee profile
router.put(
    '/:id/profile',
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'banner', maxCount: 1 }
    ]),

    employeeController.updateOrCreate.bind(employeeController)
);

router.get(
    '/:id/profile',
    employeeController.getEmployeeProfile.bind(employeeController)
);

// Jobs
router.post('/jobs/create', employeeController.createJob.bind(employeeController));
router.put('/jobs/:id', employeeController.editJob.bind(employeeController));
router.put('/jobs/:id/status', employeeController.updateJob.bind(employeeController));

router.get('/jobs', employeeController.getAllJobs.bind(employeeController));
router.get('/jobs/recent', employeeController.getRecentJobs.bind(employeeController));
router.get('/jobs/:id', employeeController.getJobs.bind(employeeController));
router.put('/jobs/status/:id', employeeController.toggleStatus.bind(employeeController));

const employeeRoutes = router;
export default employeeRoutes;
