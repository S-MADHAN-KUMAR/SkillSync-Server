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
    id: string, role: string, status: boolean
}

export interface mockINterview {
    jobRole: string,
    description: string,
    experience: string,
    mode: string,
    numberOfQuestions: string,
}
