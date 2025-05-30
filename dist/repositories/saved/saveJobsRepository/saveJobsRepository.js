"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveJobsRepository = void 0;
const saveJobsModel_1 = require("../../../models/saveJobsModel");
const genericRepository_1 = require("../../genericRepository");
class SaveJobsRepository extends genericRepository_1.GenericRepository {
    constructor() {
        super(saveJobsModel_1.savedJobsModel);
    }
}
exports.SaveJobsRepository = SaveJobsRepository;
