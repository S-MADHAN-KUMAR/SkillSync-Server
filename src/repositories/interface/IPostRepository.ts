import { Types, UpdateQuery } from "mongoose";
import { IPost } from "../../interfaces/post/IPost";
import { IGenericRepository } from "../genericRepository";
import { getRepliesPayload } from "../../types/types";

export interface IPostRepository extends IGenericRepository<IPost> {
    findRecentPosts(userId: string): Promise<IPost[]>
    findAllPosts(payload: { id: string, role: string }): Promise<any[]>
    increment(id: string, incData: UpdateQuery<IPost>): Promise<IPost | null>
    getReplies(payload: getRepliesPayload): Promise<any[]>
    findUsersPosts(payload: { id: string; userId: string; role: string; page?: number; pageSize?: number }): Promise<{ totalPosts: number; posts: any[] }>

    findAllSavedPosts(payload: { id: string; querys: string, role: string; page: number; pageSize: number }): Promise<{ posts: any[]; totalPosts: number }>
}