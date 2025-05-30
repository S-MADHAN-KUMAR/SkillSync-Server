"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplyRepository = void 0;
const replys_1 = require("../../models/post/replys");
const genericRepository_1 = require("../genericRepository");
class ReplyRepository extends genericRepository_1.GenericRepository {
    constructor() {
        super(replys_1.ReplyModel);
    }
}
exports.ReplyRepository = ReplyRepository;
