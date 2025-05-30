import { Request, Response } from "express";
import { IUserService } from "../../services/interface/IUserService";
import { OTPErrorMessages, OTPSuccessMessages, UserSuccessMessages } from "../../utils/constants";
import { Roles, StatusCode } from "../../utils/enums";
import { IUserController } from "../interface/IUserController";
import { generateTokens } from "../../utils/generateTokens";
import jwt from 'jsonwebtoken';

export class UserController implements IUserController {
    private _userService: IUserService;
    constructor(_userService: IUserService) {
        this._userService = _userService;
    }

    async register(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body;
            const response = await this._userService.register(payload);

            res.status(StatusCode.OK).json({
                success: true,
                message: UserSuccessMessages.USER_CREATED,
                user: response,
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body;
            const user = await this._userService.login(payload);

            if (user) {
                const tokens = generateTokens({
                    id: user._id as string,
                    role: user.role as Roles.EMPLOYEE | Roles.CANDIDATE | Roles.ADMIN,
                });

                res
                    .cookie(`${user.role}Token`, tokens.accessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 15 * 60 * 1000, // 15 minutes
                    })
                    .cookie('refreshToken', tokens.refreshToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 7 * 24 * 60 * 60 * 1000,
                    })
                    .status(StatusCode.OK)
                    .json({
                        success: true,
                        message: UserSuccessMessages.USER_LOGGINED,
                        user,
                        token: tokens.accessToken
                    });
            } else {
                res.status(StatusCode.UNAUTHORIZED).json({
                    success: false,
                    message: 'Invalid credentials',
                });
            }
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async getUserWithEmail(req: Request, res: Response): Promise<void> {
        try {
            const email = req.params.email
            const response = await this._userService.getUserWithEmail(email)
            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    response,
                });
            } else {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false
                });
            }
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async otpVerify(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body
            const response = await this._userService.otpVerify(payload)

            if (response) {
                const tokens = generateTokens({
                    id: response?._id as string,
                    role: response?.role as Roles.EMPLOYEE | Roles.CANDIDATE | Roles.ADMIN,
                });

                res
                    .cookie(`${response.role}Token`, tokens.accessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 15 * 60 * 1000, // 15 minutes
                    })
                    .cookie('refreshToken', tokens.refreshToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 7 * 24 * 60 * 60 * 1000,
                    })
                    .status(StatusCode.OK)
                    .json({
                        success: true,
                        message: OTPSuccessMessages.OTP_VERIFIED,
                        user: response,
                        token: tokens.accessToken
                    });

            } else {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false
                });
            }
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async forgotEmail(req: Request, res: Response): Promise<void> {
        try {
            const email = req.params.email
            const response = await this._userService.forgotEmail(email)
            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    message: OTPSuccessMessages.FORGOT_OTP_SENDED,
                    user: response,
                });
            } else {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false
                });
            }
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async resetOtp(req: Request, res: Response): Promise<void> {
        try {
            const email = req.params.email
            const response = await this._userService.resetOtp(email)
            const tokens = generateTokens({
                id: response?._id as string,
                role: response?.role as Roles.EMPLOYEE | Roles.CANDIDATE | Roles.ADMIN,
            });

            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    message: OTPSuccessMessages.OTP_RESEND,
                    user: response,
                    token: tokens?.accessToken
                });
            } else {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false
                });
            }
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async forgotOtpVerify(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body
            const response = await this._userService.forgotOtpVerify(payload)
            const tokens = generateTokens({
                id: response?._id as string,
                role: response?.role as Roles.EMPLOYEE | Roles.CANDIDATE | Roles.ADMIN,
            });
            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    message: OTPSuccessMessages.FORGOT_OTP_SENDED,
                    user: response,
                    token: tokens.accessToken
                });
            } else {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false
                });
            }
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body
            const response = await this._userService.resetPassword(payload)
            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    message: UserSuccessMessages.USER_PASSWORD_RESETED,
                    user: response,
                });
            } else {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false
                });
            }
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async logout(req: Request, res: Response): Promise<void> {
        const role = req.params.role
        res.clearCookie(`${role}Token`, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        res.status(StatusCode.OK).json({
            success: true,
            message: 'Logged out successfully',
        });
    }

    async googleAuth(req: Request, res: Response): Promise<void> {
        try {
            const { email, name, picture, role } = req.body;

            const { isExist, user } = await this._userService.googleAuth(email, name, picture, role);

            const tokens = generateTokens({
                id: user?._id as string,
                role: user?.role as Roles.EMPLOYEE | Roles.CANDIDATE | Roles.ADMIN,
            });

            res
                .cookie(`${user?.role}Token`, tokens.accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 15 * 60 * 1000,
                })
                .cookie('refreshToken', tokens.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                })
                .status(StatusCode.OK)
                .json({
                    success: true,
                    message: isExist
                        ? UserSuccessMessages.USER_LOGGINED
                        : UserSuccessMessages.USER_CREATED,
                    user,
                    token: tokens.accessToken
                });

        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async refreshToken(req: Request, res: Response): Promise<void | any> {
        const token = req.cookies.refreshToken;
        if (!token) return res.sendStatus(StatusCode.UNAUTHORIZED);

        try {
            const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as any;

            const tokens = generateTokens({
                id: payload.id,
                role: payload.role,
            });

            res.cookie(`${payload.role}Token`, tokens.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000,
            });

            res.json({ accessToken: tokens.accessToken, role: payload.role });
        } catch {
            res.clearCookie("CandidateToken");
            res.clearCookie("EmployeeToken");
            res.clearCookie("AdminToken");
            return res.sendStatus(StatusCode.FORBIDDEN);
        }
    }

    async getSavedCandidates(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 10;
            const querys = (req.query.querys as string) || "";
            const id = (req.query.id as string) || "";
            const role = (req.query.role as string) || "";
            const response = await this._userService.getSavedCandidates(
                {
                    page,
                    pageSize,
                    querys,
                    id,
                    role
                }
            )
            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    candidates: response?.candidates,
                    totalCandidates: response?.totalCandidates,
                    totalPages: response?.totalCandidates && Math.ceil(response?.totalCandidates / pageSize),
                })
            } else {
                res.status(StatusCode.OK).json({
                    success: false,
                    message: "Failed to get saved candidates"
                })
            }
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
            console.log('Error:', err.message);
        }
    }

    async saveCandidate(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body
            const response = await this._userService.saveCandidate(payload)
            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    message: "Candidate Saved"
                })
            } else {
                res.status(StatusCode.OK).json({
                    success: false,
                    message: "Failed to save candidate"
                })
            }
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
            console.log('Error:', err.message);
        }
    }

    async removeSavedCandidate(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const response = await this._userService.removeSavedCandidate(id)
            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    message: "Candidate Removed"
                })
            } else {
                res.status(StatusCode.OK).json({
                    success: false,
                    message: "Failed to remove candidate"
                })
            }
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
            console.log('Error:', err.message);
        }
    }

}