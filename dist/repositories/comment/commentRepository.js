"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRepository = void 0;
const comments_1 = require("../../models/post/comments");
const genericRepository_1 = require("../genericRepository");
class CommentRepository extends genericRepository_1.GenericRepository {
    constructor() {
        super(comments_1.CommentModel);
    }
}
exports.CommentRepository = CommentRepository;
