import { Request, Response, Router } from "express";
import upload from "../utils/upload";
import { employeeController } from "../config/dependencyInjector";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Roles } from "../utils/enums";

const router = Router();

// Employee profile
router.put(
    '/:id/profile',
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'banner', maxCount: 1 }
    ])

    , authMiddleware([Roles.EMPLOYEE]),
    employeeController.updateOrCreate.bind(employeeController)
);

router.get(
    '/:id/profile',
    authMiddleware([Roles.EMPLOYEE, Roles.CANDIDATE]),
    employeeController.getEmployeeProfile.bind(employeeController)
);


router.get('/all', authMiddleware([Roles.EMPLOYEE, Roles.CANDIDATE]), employeeController.getAllEmployees.bind(employeeController))
router.get('/detail/:id', authMiddleware([Roles.EMPLOYEE, Roles.CANDIDATE]), employeeController.getEmployeeDetail.bind(employeeController))

// Jobs
router.post('/jobs/create', authMiddleware([Roles.EMPLOYEE]), employeeController.createJob.bind(employeeController));
router.put('/jobs/update/:id', authMiddleware([Roles.EMPLOYEE]), employeeController.editJob.bind(employeeController));
router.put('/jobs/:id/status', authMiddleware([Roles.EMPLOYEE]), employeeController.updateJob.bind(employeeController));

router.get('/jobs', authMiddleware([Roles.EMPLOYEE, Roles.CANDIDATE]), employeeController.getAllJobs.bind(employeeController));
router.get('/jobs/recent/:id', authMiddleware([Roles.EMPLOYEE]), employeeController.getRecentJobs.bind(employeeController));
router.post('/jobs/details', authMiddleware([Roles.EMPLOYEE, Roles.CANDIDATE]), employeeController.getJob.bind(employeeController));
router.get('/jobs/:id', authMiddleware([Roles.EMPLOYEE, Roles.CANDIDATE]), employeeController.getJobs.bind(employeeController));
router.put('/jobs/status/:id', authMiddleware([Roles.EMPLOYEE]), employeeController.toggleStatus.bind(employeeController));

router.get('/get/statistics/:id', authMiddleware([Roles.EMPLOYEE]), employeeController.getStatistics.bind(employeeController))

const employeeRoutes = router;
export default employeeRoutes;
