import { IReply } from "../../interfaces/post/IReply";
import { ReplyModel } from "../../models/post/replys";
import { GenericRepository } from "../genericRepository";
import { IReplyRepository } from "../interface/IReplyRepository";

export class ReplyRepository
    extends GenericRepository<IReply>
    implements IReplyRepository {
    constructor() {
        super(ReplyModel);
    }
}
