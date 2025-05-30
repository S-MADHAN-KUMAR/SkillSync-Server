export enum StatusCode {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,  // Client error (invalid input, missing fields)
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,  // Resource not found
    CONFLICT = 409,  // Conflict with current state (e.g., duplicate entry)
    INTERNAL_SERVER_ERROR = 500,
}


export enum Roles {
    ADMIN = 'admin',
    EMPLOYEE = 'employee',
    CANDIDATE = 'candidate'
}

export enum VerifiedStatus {
    REJECTED = "rejected",
    APPROVED = 'approved',
    PENDING = 'pending'
}
export enum TransactionType {
    DEBITED = "debit",
    CREDITED = "credit"
}