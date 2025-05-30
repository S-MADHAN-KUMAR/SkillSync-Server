import { IComment } from "../../interfaces/post/IComment";
import { CommentModel } from "../../models/post/comments";
import { GenericRepository } from "../genericRepository";
import { ICommentRepository } from "../interface/ICommentRepository";

export class CommentRepository
    extends GenericRepository<IComment>
    implements ICommentRepository {
    constructor() {
        super(CommentModel);
    }
}
