"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dependencyInjector_1 = require("../config/dependencyInjector");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const enums_1 = require("../utils/enums");
const router = (0, express_1.Router)();
router.post('/request', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.followController.request.bind(dependencyInjector_1.followController));
router.post('/accept', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.followController.accept.bind(dependencyInjector_1.followController));
router.post('/cancel', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.followController.cancel.bind(dependencyInjector_1.followController));
router.post('/unfollow', (0, authMiddleware_1.authMiddleware)([enums_1.Roles.CANDIDATE, enums_1.Roles.EMPLOYEE]), dependencyInjector_1.followController.unfollow.bind(dependencyInjector_1.followController));
// router.post('/update/:id', followController.update.bind(followController))
const followRoutes = router;
exports.default = followRoutes;
