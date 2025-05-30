import { IConnection } from "../../interfaces/IConnection";
import { ConnectionModel } from "../../models/connectionModel";
import { GenericRepository } from "../genericRepository";
import { IConnectionsRepository } from "../interface/IConnectionsRepository";

export class ConnectionsRepository
    extends GenericRepository<IConnection>
    implements IConnectionsRepository {
    constructor() {
        super(ConnectionModel);
    }
}