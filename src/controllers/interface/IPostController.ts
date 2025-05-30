import { Request, Response } from "express";

export interface IPostController {
    createPost(req: Request, res: Response): Promise<void>
    getRecentPosts(req: Request, res: Response): Promise<void>
    getAllPosts(req: Request, res: Response): Promise<void>
    getUserPosts(req: Request, res: Response): Promise<void>
    getPost(req: Request, res: Response): Promise<void>
    updatePost(req: Request, res: Response): Promise<void>
    toggleStatus(req: Request, res: Response): Promise<void>
    likePost(req: Request, res: Response): Promise<void>
    commentpost(req: Request, res: Response): Promise<void>
    replyComment(req: Request, res: Response): Promise<void>
    nestesReply(req: Request, res: Response): Promise<void>
    getReplies(req: Request, res: Response): Promise<void>
    removeComment(req: Request, res: Response): Promise<void>
    removeReply(req: Request, res: Response): Promise<void>
    removeNestedReply(req: Request, res: Response): Promise<void>
    getUserAllPosts(req: Request, res: Response): Promise<void>
    savePost(req: Request, res: Response): Promise<void>
    getAllSavedPosts(req: Request, res: Response): Promise<void>
    removeSavedPost(req: Request, res: Response): Promise<void>
}