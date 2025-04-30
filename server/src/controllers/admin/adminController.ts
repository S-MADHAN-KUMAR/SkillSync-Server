import { Request, Response } from "express";
import { IAdminService } from "../../services/interface/IAdminService";
import { IAdminControllers } from "../interface/IAdminControllers";
import { StatusCode } from "../../utils/enums";
import { adminGenerateToken } from "../../utils/generateToken";
import { IUserService } from "../../services/interface/IUserService";

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
            const token = adminGenerateToken(payload?.email)
            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    response,
                    token,
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

    async getCandidates(req: Request, res: Response): Promise<void> {
        try {
            const page = Number(req.query.page) || 1;
            const pageSize = Number(req.query.pageSize) || 10;

            console.log(`Page: ${page}, Page Size: ${pageSize}`);

            const { candidates, totalCandidates } = await this._userService.getAllCandidates(page, pageSize);

            console.log('Total candidates:', totalCandidates);
            console.log('candidates:', candidates);

            res.status(StatusCode.OK).json({
                success: true,
                candidates,
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

            const { employees, totalEmployees } = await this._userService.getAllEmployees(page, pageSize);

            console.log('Total candidates:', totalEmployees);
            console.log('employees:', employees);

            res.status(StatusCode.OK).json({
                success: true,
                employees,
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
            const id = req.params.id;

            payload = {
                ...payload,
                id
            };

            const response = await this._userService.toggleStatus(payload);

            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    response,
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