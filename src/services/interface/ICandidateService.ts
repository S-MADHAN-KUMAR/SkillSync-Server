import { ICandidateProfile } from "../../interfaces/ICandidateProfile";
import { ISavedJobs } from "../../interfaces/IISavedJobs";
import { IJobPost } from "../../interfaces/IJobPost";
import { IMessage } from "../../interfaces/IMessage";
import { IUser } from "../../interfaces/IUser";

export interface ICandidateService {
    updateOrCreate(payload: Partial<ICandidateProfile>, id: string): Promise<{ response: ICandidateProfile, user: IUser | null }>
    getCandidateProfile(payload: { id: string, connectionId?: string }): Promise<ICandidateProfile | null>;
    getAllCandidates(
        page: number,
        pageSize: number,
        querys?: string,
        location?: string,
        omit?: string,
        userId?: string
    ): Promise<{ candidates: ICandidateProfile[]; totalCandidates: number }>
    saveJob(payload: {
        userId: string,
        jobId: string
    }): Promise<boolean | null>
    removeSaveJob(id: string): Promise<boolean | null>
    getAllSavedJobs(payload: {
        page: number;
        pageSize: number;
        querys: string;
        id: string
    }): Promise<{ jobs: IJobPost[]; totalJobs: number }>
    getStatistics(id: string): Promise<{
        totalJobs: number,
        savedPosts: number,
        savedCandidates: number
    } | null>
    getConnectedUsers(id: string): Promise<{ user: ICandidateProfile; isOnline: boolean }[] | null>
    messageTo(payload: {
        senderId: string,
        recipientId: string,
        content: string,
        imageUrls: string[]
    }): Promise<boolean | null>
    getMessages(payload: {
        senderId: string;
        recipientId: string;
    }): Promise<{ messages: IMessage[] | null }>
    getUnSeenMessageCount(id: string): Promise<{ messages: number | null }>
    removeMessage(id: string): Promise<boolean | null>
    updateSeen(id: string): Promise<boolean | null>
    updateEditMessage(payload: { id: string, content: string }): Promise<boolean | null>
}