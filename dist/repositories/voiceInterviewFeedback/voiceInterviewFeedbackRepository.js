"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceInterviewFeedbackRepository = void 0;
const voiceInterviewFeedbackModel_1 = __importDefault(require("../../models/voiceInterviewFeedbackModel"));
const genericRepository_1 = require("../genericRepository");
class VoiceInterviewFeedbackRepository extends genericRepository_1.GenericRepository {
    constructor() {
        super(voiceInterviewFeedbackModel_1.default);
    }
}
exports.VoiceInterviewFeedbackRepository = VoiceInterviewFeedbackRepository;
