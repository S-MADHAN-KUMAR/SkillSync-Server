export type login = {
    email: string,
    password: string
}

export type otp = {
    id: string,
    otp: string
}

export type resetPassword = {
    id: string,
    password: string
}
export type status = {
    id: string, role?: string, status: boolean
}

export interface mockINterview {
    jobRole: string,
    description: string,
    experience: string,
    mode: string,
    numberOfQuestions: string,
}

export interface Interview {
    interviewDuration: string,
    interviewTypes: string[],
    jobDescription: string,
    jobTitle: string
    interviewFor: string
}

export interface ConnectionRequest {
    userId: string
    connectedUserId: string
    status?: "pending" | "accepted" | "rejected"
    notificationId?: string
}
export interface commentPayload {
    content: string
    postId: string
}
export interface replyCommentPayload {
    content: string
    postId: string
    commentId?: string
    for: string,
    parentReplyId?: string
}
export interface getRepliesPayload {
    parentId: string
    type: string,
}