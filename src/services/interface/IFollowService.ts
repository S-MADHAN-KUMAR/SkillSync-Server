export interface FollowRequest {
    userId: string
    followingId: string
    notificationId?: string
    status: "pending" | "accepted" | "rejected"
    userType: "candidate" | "company"
}

export interface IFollowService {
    request(payload: FollowRequest): Promise<boolean | null>
    accept(payload: FollowRequest): Promise<boolean | null>
    cancel(payload: FollowRequest): Promise<boolean | null>
    unfollow(payload: FollowRequest): Promise<boolean | null>
}