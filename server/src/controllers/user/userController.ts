import { Request, Response } from "express";
import { IUserService } from "../../services/interface/IUserService";
import { OTPErrorMessages, OTPSuccessMessages, UserSuccessMessages } from "../../utils/constants";
import { StatusCode } from "../../utils/enums";
import { IUserController } from "../interface/IUserController";
import { generateTokens } from "../../utils/generateTokens";
import jwt from 'jsonwebtoken';

export class UserController implements IUserController {
    private userService: IUserService;
    constructor(userService: IUserService) {
        this.userService = userService;
    }

    async register(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body;
            const response = await this.userService.register(payload);
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
            const user = await this.userService.login(payload);

            if (user) {
                const tokens = generateTokens({
                    id: user._id as string,
                    role: user.role as "employee" | "candidate" | "admin",
                });

                res
                    .cookie(`${user.role}AccessToken`, tokens.accessToken, {
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
            const response = await this.userService.getUserWithEmail(email)
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
            const response = await this.userService.otpVerify(payload)

            if (response) {
                const tokens = generateTokens({
                    id: response?._id as string,
                    role: response?.role as "employee" | "candidate" | "admin",
                });

                res
                    .cookie(`${response.role}AccessToken`, tokens.accessToken, {
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
            const response = await this.userService.forgotEmail(email)
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
            const response = await this.userService.resetOtp(email)
            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    message: OTPSuccessMessages.OTP_RESEND,
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

    async forgotOtpVerify(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body
            const response = await this.userService.forgotOtpVerify(payload)
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

    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body
            const response = await this.userService.resetPassword(payload)
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

    async googleAuth(req: Request, res: Response): Promise<void> {
        try {
            const { email, name, picture, role } = req.body;

            const { isExist, user } = await this.userService.googleAuth(email, name, picture, role);

            const tokens = generateTokens({
                id: user?._id as string,
                role: user?.role as "employee" | "candidate" | "admin",
            });

            res
                .cookie(`${user?.role}AccessToken`, tokens.accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 15 * 1000, // 15 minutes
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
                });

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
        res.clearCookie(`${role}AccessToken`, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    }

    async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const token = req.cookies.refreshToken;

            if (!token) {
                res.status(StatusCode.UNAUTHORIZED).json({ success: false, message: 'No refresh token provided' });
                return;
            }

            jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!, (err: any, decoded: any) => {
                if (err || !decoded || typeof decoded !== 'object') {
                    res.status(StatusCode.FORBIDDEN).json({ success: false, message: 'Invalid or expired refresh token' });
                    return;
                }

                const { id, role } = decoded as { id: string; role: 'candidate' | 'employee' | 'admin' };

                const { accessToken, refreshToken } = generateTokens({ id, role });

                res
                    .cookie(`${role}AccessToken`, accessToken, {
                        httpOnly: false,
                        secure: process.env.NODE_ENV === 'production',
                        maxAge: 5 * 1000, // 5 seconds for testing
                    })
                    .cookie('refreshToken', refreshToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                    })
                    .status(StatusCode.OK)
                    .json({ success: true, accessToken });
            });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error during token refresh' });
        }
    }
}