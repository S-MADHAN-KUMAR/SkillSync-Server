"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsRepository = void 0;
const applicationModel_1 = __importDefault(require("../../models/applicationModel"));
const genericRepository_1 = require("../genericRepository");
class ApplicationsRepository extends genericRepository_1.GenericRepository {
    constructor() {
        super(applicationModel_1.default);
    }
}
exports.ApplicationsRepository = ApplicationsRepository;
