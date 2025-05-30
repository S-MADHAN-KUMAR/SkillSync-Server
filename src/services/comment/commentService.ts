import { ICommentRepository } from "../../repositories/interface/ICommentRepository";
import { ICommentService } from "../interface/ICommentService";

export class CommentService implements ICommentService {
    private _commentRepository: ICommentRepository

    constructor(_commentRepository: ICommentRepository) {
        this._commentRepository = _commentRepository;
    }
}