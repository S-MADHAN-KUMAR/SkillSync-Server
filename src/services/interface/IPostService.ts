import { IPost } from "../../interfaces/post/IPost";
import { IReply } from "../../interfaces/post/IReply";
import { ISavedPost } from "../../interfaces/post/ISavedPost";
import { commentPayload, getRepliesPayload, replyCommentPayload } from "../../types/types";


export interface IPostService {
    createPost(payload: Partial<IPost>, id: string): Promise<{ response: IPost | null }>
    getRecentPosts(id: string): Promise<IPost[] | null>
    getAllPosts(payload: { id: string, role: string }): Promise<IPost[] | null>
    getUserPosts(page: number,
        pageSize: number,
        querys?: string,
        userId?: string
    ): Promise<{ posts: IPost[]; totalPosts: number | null }>
    getUserAllPosts(page: number,
        pageSize: number,
        id: string,
        userId: string,
        role: string
    ): Promise<{ posts: IPost[]; totalPosts: number | null }>
    getPost(id: string): Promise<IPost | null>
    updatePost(payload: IPost, id: string): Promise<IPost | null>
    toggleStatus(status: boolean, id: string): Promise<IPost | null>
    togglePostStatus(status: boolean, id: string): Promise<IPost | null>
    likePost(id: string, postId: string): Promise<IPost | null>
    commentpost(userId: string, payload: commentPayload): Promise<IPost | null>
    replyComment(userId: string, payload: replyCommentPayload): Promise<boolean | null>
    nestesReply(userId: string, payload: replyCommentPayload): Promise<boolean | null>
    getReplies(payload: getRepliesPayload): Promise<IReply[] | null>
    removeComment(id: string): Promise<boolean | null>
    removeReply(id: string): Promise<boolean | null>
    removeNestedReply(id: string): Promise<boolean | null>
    savePost(payload: {
        userId: string,
        userRole: string,
        postId: string
    }): Promise<boolean | null>
    removeSavePost(id: string): Promise<boolean | null>
    getAllSavedPosts(page: number,
        pageSize: number,
        userId: string,
        querys: string,
        role: string
    ): Promise<{ posts: ISavedPost[]; totalPosts: number | null }>
}