"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsRepository = void 0;
const notificationModel_1 = __importDefault(require("../../models/notificationModel"));
const genericRepository_1 = require("../genericRepository");
class NotificationsRepository extends genericRepository_1.GenericRepository {
    constructor() {
        super(notificationModel_1.default);
    }
}
exports.NotificationsRepository = NotificationsRepository;
