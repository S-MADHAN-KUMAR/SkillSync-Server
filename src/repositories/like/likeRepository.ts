import { ILike } from "../../interfaces/post/ILike";
import { LikeModel } from "../../models/post/likes";
import { GenericRepository } from "../genericRepository";
import { ILikeRepository } from "../interface/ILikeRepository";

export class LikeRepository
    extends GenericRepository<ILike>
    implements ILikeRepository {
    constructor() {
        super(LikeModel);
    }
}
