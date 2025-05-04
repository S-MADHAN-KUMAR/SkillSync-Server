import { Request, Response } from "express";
import { IUserService } from "../../services/interface/IUserService";
import { OTPErrorMessages, OTPSuccessMessages, UserSuccessMessages } from "../../utils/constants";
import { StatusCode } from "../../utils/enums";
import { IUserController } from "../interface/IUserController";
import { candidateGenerateToken, recruiterGenerateToken } from "../../utils/generateToken";

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
                const token = user.role === 'candidate'
                    ? candidateGenerateToken(user.email as string)
                    : recruiterGenerateToken(user.email);

                res.status(StatusCode.OK).json({
                    success: true,
                    token,
                    message: UserSuccessMessages.USER_LOGGINED,
                    user,
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

    async googleAuth(req: Request, res: Response): Promise<void> {
        try {
            const { email, name, picture, role } = req.body;
            const { isExist, user } = await this.userService.googleAuth(email, name, picture, role);

            const candidateToken = candidateGenerateToken(email);
            const recruiterToken = recruiterGenerateToken(email);

            const token = role === 'candidate' ? candidateToken : recruiterToken;

            if (isExist) {
                res.status(StatusCode.OK).json({
                    success: true,
                    token,
                    message: UserSuccessMessages.USER_LOGGINED,
                    user,
                });
            } else {
                res.status(StatusCode.OK).json({
                    success: true,
                    token,
                    message: UserSuccessMessages.USER_CREATED,
                    user,
                });
            }
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    };

    async otpVerify(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body
            const response = await this.userService.otpVerify(payload)
            const candidateToken = candidateGenerateToken(response?.email as string);
            const recruiterToken = recruiterGenerateToken(response?.email as string);

            const token = response?.role === 'candidate' ? candidateToken : recruiterToken;
            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    message: OTPSuccessMessages.OTP_VERIFIED,
                    token,
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







}