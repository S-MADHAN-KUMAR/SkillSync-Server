"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeRepository = void 0;
const likes_1 = require("../../models/post/likes");
const genericRepository_1 = require("../genericRepository");
class LikeRepository extends genericRepository_1.GenericRepository {
    constructor() {
        super(likes_1.LikeModel);
    }
}
exports.LikeRepository = LikeRepository;
