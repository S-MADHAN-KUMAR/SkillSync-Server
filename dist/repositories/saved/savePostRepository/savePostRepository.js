"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavePostsRepository = void 0;
const savePost_1 = require("../../../models/post/savePost");
const genericRepository_1 = require("../../genericRepository");
class SavePostsRepository extends genericRepository_1.GenericRepository {
    constructor() {
        super(savePost_1.SavedPostModel);
    }
}
exports.SavePostsRepository = SavePostsRepository;
