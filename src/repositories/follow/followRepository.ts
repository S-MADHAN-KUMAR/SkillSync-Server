import { IFollow } from "../../interfaces/IFollow";
import { FollowModel } from "../../models/followModel";
import { GenericRepository } from "../genericRepository";
import { IFollowRepository } from "../interface/IFollowRepository";

export class FollowRepository
    extends GenericRepository<IFollow>
    implements IFollowRepository {
    constructor() {
        super(FollowModel);
    }
}
