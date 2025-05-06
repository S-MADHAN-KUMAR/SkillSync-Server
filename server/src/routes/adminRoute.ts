import { Request, Response, Router } from "express";
import { adminController } from "../config/dependencyInjector";
import { adminAuth } from "../middlewares/adminAuth";

const router = Router();

router.post('/login', adminController.adminLogin.bind(adminController));

router.post('/logout', adminController.logout.bind(adminController));

router.get('/candidates', adminController.getCandidates.bind(adminController));

router.get('/employees', adminController.getEmployees.bind(adminController));

router.put('/users/status', adminController.toggleStatus.bind(adminController));

const adminRoutes = router;
export default adminRoutes;
