"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowRepository = void 0;
const followModel_1 = require("../../models/followModel");
const genericRepository_1 = require("../genericRepository");
class FollowRepository extends genericRepository_1.GenericRepository {
    constructor() {
        super(followModel_1.FollowModel);
    }
}
exports.FollowRepository = FollowRepository;
