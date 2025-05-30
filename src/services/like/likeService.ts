import { ILikeRepository } from "../../repositories/interface/ILikeRepository";
import { ILikeService } from "../interface/ILikeService";

export class LikeService implements ILikeService {
    private _likeRepository: ILikeRepository

    constructor(_likeRepository: ILikeRepository) {
        this._likeRepository = _likeRepository;
    }
}