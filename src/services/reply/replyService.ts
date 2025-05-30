import { IReplyRepository } from "../../repositories/interface/IReplyRepository";
import { IReplyService } from "../interface/IReplyService";

export class ReplyService implements IReplyService {
    private _replyRepository: IReplyRepository

    constructor(_replyRepository: IReplyRepository) {
        this._replyRepository = _replyRepository;
    }
}