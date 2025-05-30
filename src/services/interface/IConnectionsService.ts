import { ConnectionRequest } from "../../types/types";

export interface IConnectionsService {
    request(payload: ConnectionRequest): Promise<boolean | null>
    accept(payload: ConnectionRequest): Promise<boolean | null>
    cancel(payload: ConnectionRequest): Promise<boolean | null>
    makeAllRead(id: string): Promise<boolean | null>
    disconnect(payload: ConnectionRequest): Promise<boolean | null>
}