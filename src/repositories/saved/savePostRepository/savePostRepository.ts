import { ISavedPost } from "../../../interfaces/post/ISavedPost";
import { SavedPostModel } from "../../../models/post/savePost";
import { GenericRepository } from "../../genericRepository";
import { ISavePostsRepository } from "../../interface/ISavePostsRepository";

export class SavePostsRepository
    extends GenericRepository<ISavedPost>
    implements ISavePostsRepository {
    constructor() {
        super(SavedPostModel);
    }
}
