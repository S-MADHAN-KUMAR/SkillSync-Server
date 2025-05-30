"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const userModel_1 = __importDefault(require("../../models/userModel"));
const genericRepository_1 = require("../genericRepository");
class UserRepository extends genericRepository_1.GenericRepository {
    constructor() {
        super(userModel_1.default);
    }
}
exports.UserRepository = UserRepository;
