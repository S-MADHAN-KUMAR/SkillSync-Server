"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiRepository = void 0;
const aiMockInterviewModel_1 = __importDefault(require("../../models/aiMockInterviewModel"));
const genericRepository_1 = require("../genericRepository");
class AiRepository extends genericRepository_1.GenericRepository {
    constructor() {
        super(aiMockInterviewModel_1.default);
    }
}
exports.AiRepository = AiRepository;
