export const MongoDB = {
    SUCCESS: "MongoDB connected",
    ERROR: "MongoDB connection error",
    DB_ERROR: "Error Saving in DB"
};

export const GeneralServerErrorMsg = {
    INTERNAL_SERVER_ERROR: "Internal server error!",
    DATABASE_ERROR: "Database operation failed!",
    OPERATION_FAILED: "Operation could not be completed!",
    UNEXPECTED_ERROR: "An unexpected error occurred!",
    INVALID_SERVICE_CONFIG: "Invalid service configuration",
};

export const JobPost = {
    JOB_CREATED: "Job post created successfully.",
    JOB_UPDATED: "Job post updated successfully",
    JOB_REMOVED: "Job post removed successfully"
}

export const JobPostErrorMessages = {
    JOB_NOT_FOUND: "Job post not found.",
    JOB_FAILD_TO_CREATE: "Job post failed to create"
}

export const UserErrorMessages = {
    USER_FAILED_TO_CREATED: "Email or Mobile number already exist",
    INVALID_CREDENTIALS: "Invalid credentials provided.",
    USER_NOT_FOUND: "User not exist",
    USER_BLOCKED: "User blocked",
    USER_NOT_REGISTER: "User not exists, Please Register again!",
    USER_WRONG_OTP: "OTP Incorrect",
    OTP_EXPIRED: "OTP expired",
    INVALID_PAYLOAD: "Invalid credentials"
}

export const UserSuccessMessages = {
    USER_CREATED: "User account created successfully.",
    USER_LOGGINED: "User loggined successfully.",
    USER_UPDATED: "User account updated successfully",
    USER_VERIFIED: "User account verified successfully",
    USER_OTP_SENDED: "Forgot OTP sended successfully",
    USER_PASSWORD_RESETED: "User password reseted successfully."
}
export const OTPSuccessMessages = {
    USER_CREATED: "User account created successfully.",
    USER_LOGGINED: "User loggined successfully.",
    USER_UPDATED: "User account updated successfully",
    USER_VERIFIED: "User account verified successfully",
    USER_OTP_SENDED: "Forgot OTP sended successfully",
    USER_PASSWORD_RESETED: "User password reseted successfully."
}
export const OTPErrorMessages = {
    USER_CREATED: "User account created successfully.",
    USER_LOGGINED: "User loggined successfully.",
    USER_UPDATED: "User account updated successfully",
    USER_VERIFIED: "User account verified successfully",
    USER_OTP_SENDED: "Forgot OTP sended successfully",
    USER_PASSWORD_RESETED: "User password reseted successfully."
}

export const AdminErrorMessages = {
    ADMIN_INVALID_CRENDIALS: "Invalid credentials"
}

export const AdminSuccessMessages = {
    ADMIN_LOGGED_IN: "Admin loggedin successfully.",
    ADMIN_LOGIN_FAIL: "Admin failed to login",
    ADMIN_INVALID_LOGIN: "Invalid credentials provided."
}

export const SocketErrors = {
    INTERNAL_SOCKET_ERROR: "Internal Socket server error!",
    FAILED_TO_REGISTER: "Failed to register socket handlers:",
    SERVER_CLOSED: "Socket.IO server closed",
    SHUTDOWN_ERROR: "Error during shutdown:"
}

export const JwtErrorMsg = {
    JWT_NOT_FOUND: "JWT not found in the cookies",
    INVALID_JWT: "Invalid JWT",
    JWT_EXPIRATION: "1h",
    JWT_REFRESH_EXPIRATION: "6h",
};

export const EnvErrorMsg = {
    CONST_ENV: "",
    JWT_NOT_FOUND: "JWT secret not found in the env",
    NOT_FOUND: "Env not found",
    ADMIN_NOT_FOUND: "Environment variables for admin credentials not found",
};