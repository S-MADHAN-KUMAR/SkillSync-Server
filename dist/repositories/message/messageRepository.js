"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRepository = void 0;
const messageModel_1 = __importDefault(require("../../models/messageModel"));
const genericRepository_1 = require("../genericRepository");
class MessageRepository extends genericRepository_1.GenericRepository {
    constructor() {
        super(messageModel_1.default);
    }
}
exports.MessageRepository = MessageRepository;
