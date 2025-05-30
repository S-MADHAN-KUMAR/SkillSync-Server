"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveCandidateRepository = void 0;
const saveCandidateModel_1 = require("../../../models/saveCandidateModel");
const genericRepository_1 = require("../../genericRepository");
class SaveCandidateRepository extends genericRepository_1.GenericRepository {
    constructor() {
        super(saveCandidateModel_1.savedCandidateModel);
    }
}
exports.SaveCandidateRepository = SaveCandidateRepository;
