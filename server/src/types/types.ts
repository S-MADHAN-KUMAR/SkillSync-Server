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


