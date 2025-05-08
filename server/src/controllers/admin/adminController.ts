import { Request, Response } from "express";
import { IAdminService } from "../../services/interface/IAdminService";
import { IAdminControllers } from "../interface/IAdminController";
import { StatusCode } from "../../utils/enums";
import { IUserService } from "../../services/interface/IUserService";
import { AdminSuccessMessages, UserSuccessMessages } from "../../utils/constants";
import { generateTokens } from "../../utils/generateTokens";

export class AdminController implements IAdminControllers {
    private _admineService: IAdminService;
    private _userService: IUserService;
    constructor(_admineService: IAdminService, _userService: IUserService) {
        this._admineService = _admineService;
        this._userService = _userService;
    }

    async adminLogin(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body
            const response = await this._admineService.adminLogin(payload)
            const tokens = generateTokens({
                role: 'admin'
            });
            res
                .cookie('adminAccessToken', tokens.accessToken, {
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
            res.status(StatusCode.OK).json({
                success: true,
                message: AdminSuccessMessages.ADMIN_LOGGED_IN,
                response,
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

        res.clearCookie(`adminAccessToken`, {
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


    async getCandidates(req: Request, res: Response): Promise<void> {
        try {
            const page = Number(req.query.page) || 1;
            const pageSize = Number(req.query.pageSize) || 10;
            const querys = (req.query.querys as string) || "";

            const { candidates, totalCandidates } = await this._userService.getAllCandidates(page, pageSize, querys);

            res.status(StatusCode.OK).json({
                success: true,
                users: candidates,
                totalCandidates,
                totalPages: Math.ceil(totalCandidates / pageSize),
                currentPage: page
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async getEmployees(req: Request, res: Response): Promise<void> {
        try {
            const page = Number(req.query.page) || 1;
            const pageSize = Number(req.query.pageSize) || 10;
            const querys = (req.query.querys as string) || "";

            const { employees, totalEmployees } = await this._userService.getAllEmployees(page, pageSize, querys);

            res.status(StatusCode.OK).json({
                success: true,
                users: employees,
                totalEmployees,
                totalPages: Math.ceil(totalEmployees / pageSize),
                currentPage: page
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }

    }

    async toggleStatus(req: Request, res: Response): Promise<void> {
        try {
            let payload = req.body;

            const response = await this._userService.toggleStatus(payload);

            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    response,
                    message: payload.status ? UserSuccessMessages.USER_BLOCKED : UserSuccessMessages.USER_UNBLOCKED,
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