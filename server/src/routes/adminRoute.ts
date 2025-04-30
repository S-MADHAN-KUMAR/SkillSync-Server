import { Request, Response, Router } from "express";
import { adminController } from "../config/dependencyInjector";
import { adminAuth } from "../middlewares/adminAuth";

const router = Router();

router.post('/admins/login', adminController.adminLogin.bind(adminController));

router.get('/candidates', adminAuth, adminController.getCandidates.bind(adminController));

router.get('/employees', adminAuth, adminController.getEmployees.bind(adminController));

router.put('/users/:id/status', adminAuth, adminController.toggleStatus.bind(adminController));

const adminRoutes = router;
export default adminRoutes;
