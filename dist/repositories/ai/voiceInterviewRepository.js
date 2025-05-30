"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceInterviewRepository = void 0;
const aiVoiceInterviewModel_1 = __importDefault(require("../../models/aiVoiceInterviewModel"));
const genericRepository_1 = require("../genericRepository");
class VoiceInterviewRepository extends genericRepository_1.GenericRepository {
    constructor() {
        super(aiVoiceInterviewModel_1.default);
    }
}
exports.VoiceInterviewRepository = VoiceInterviewRepository;
