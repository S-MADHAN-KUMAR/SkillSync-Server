"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewConversationRepository = void 0;
const interviewConversationModel_1 = __importDefault(require("../../models/interviewConversationModel"));
const genericRepository_1 = require("../genericRepository");
class InterviewConversationRepository extends genericRepository_1.GenericRepository {
    constructor() {
        super(interviewConversationModel_1.default);
    }
}
exports.InterviewConversationRepository = InterviewConversationRepository;
