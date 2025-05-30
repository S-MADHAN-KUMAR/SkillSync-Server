"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionsRepository = void 0;
const connectionModel_1 = require("../../models/connectionModel");
const genericRepository_1 = require("../genericRepository");
class ConnectionsRepository extends genericRepository_1.GenericRepository {
    constructor() {
        super(connectionModel_1.ConnectionModel);
    }
}
exports.ConnectionsRepository = ConnectionsRepository;
