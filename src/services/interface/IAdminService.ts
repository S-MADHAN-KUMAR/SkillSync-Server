import { IPost } from "../../interfaces/post/IPost";
import { login, status } from "../../types/types";

export interface IAdminService {
    adminLogin(payload: login): Promise<Boolean | null>;
    getPosts(page: number, pageSize: number, querys?: any, userId?: string, role?: string): Promise<{ posts: IPost[], totalPosts: number | null }>
    getStatistics(): Promise<{
        totalCandidates: unknown,
        totalEmployees: unknown,
        totalJobs: unknown,
        totalPosts: unknown,
        lastMonthPosts: unknown,
        lastMonthJobs: unknown,
        lastMonthUsers: unknown
    } | null>
}