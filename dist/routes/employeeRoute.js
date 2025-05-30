"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = __importDefault(require("../utils/upload"));
const dependencyInjector_1 = require("../config/dependencyInjector");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const enums_1 = require("../utils/enums");
const router = (0, express_1.Router)();
// Employee profile
router.put('/:id/profile', upload_1.default.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), (0, authMiddleware_1.authMiddleware)([enums_1.Roles.EMPLOYEE]), dependencyInjector_1.employeeController.updateOrCreate.bind(dependencyInjector_1.employeeController));
router.get('/:id/profile', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.EMPLOYEE, enums_1.Roles.CANDIDATE]), dependencyInjector_1.employeeController.getEmployeeProfile.bind(dependencyInjector_1.employeeController));
router.get('/all', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.EMPLOYEE, enums_1.Roles.CANDIDATE]), dependencyInjector_1.employeeController.getAllEmployees.bind(dependencyInjector_1.employeeController));
router.get('/detail/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.EMPLOYEE, enums_1.Roles.CANDIDATE]), dependencyInjector_1.employeeController.getEmployeeDetail.bind(dependencyInjector_1.employeeController));
// Jobs
router.post('/jobs/create', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.EMPLOYEE]), dependencyInjector_1.employeeController.createJob.bind(dependencyInjector_1.employeeController));
router.put('/jobs/update/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.EMPLOYEE]), dependencyInjector_1.employeeController.editJob.bind(dependencyInjector_1.employeeController));
router.put('/jobs/:id/status', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.EMPLOYEE]), dependencyInjector_1.employeeController.updateJob.bind(dependencyInjector_1.employeeController));
router.get('/jobs', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.EMPLOYEE, enums_1.Roles.CANDIDATE]), dependencyInjector_1.employeeController.getAllJobs.bind(dependencyInjector_1.employeeController));
router.get('/jobs/recent/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.EMPLOYEE]), dependencyInjector_1.employeeController.getRecentJobs.bind(dependencyInjector_1.employeeController));
router.post('/jobs/details', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.EMPLOYEE, enums_1.Roles.CANDIDATE]), dependencyInjector_1.employeeController.getJob.bind(dependencyInjector_1.employeeController));
router.get('/jobs/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.EMPLOYEE, enums_1.Roles.CANDIDATE]), dependencyInjector_1.employeeController.getJobs.bind(dependencyInjector_1.employeeController));
router.put('/jobs/status/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.EMPLOYEE]), dependencyInjector_1.employeeController.toggleStatus.bind(dependencyInjector_1.employeeController));
router.get('/get/statistics/:id', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.EMPLOYEE]), dependencyInjector_1.employeeController.getStatistics.bind(dependencyInjector_1.employeeController));
const employeeRoutes = router;
exports.default = employeeRoutes;
