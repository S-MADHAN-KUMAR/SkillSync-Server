import { Request, Response, Router } from "express";
import upload from "../utils/upload";
import { employeeController } from "../config/dependencyInjector";

const router = Router();

// Employee profile
router.put(
    '/employees/:id/profile',
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'banner', maxCount: 1 }
    ]),

    employeeController.updateOrCreate.bind(employeeController)
);

router.get(
    '/employees/:id/profile',
    employeeController.getEmployeeProfile.bind(employeeController)
);

// Jobs
router.post('/jobs', employeeController.createJob.bind(employeeController));
router.put('/jobs/:id', employeeController.editJob.bind(employeeController));
router.put('/jobs/:id/status', employeeController.updateJob.bind(employeeController)); // if updating status or similar

router.get('/jobs', employeeController.getAllJobs.bind(employeeController));
router.get('/jobs/recent', employeeController.getRecentJobs.bind(employeeController));
router.get('/jobs/:id', employeeController.getJobs.bind(employeeController));
router.delete('/jobs/:id', employeeController.removeJob.bind(employeeController));

const employeeRoutes = router;
export default employeeRoutes;
