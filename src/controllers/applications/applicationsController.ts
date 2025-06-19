import { Request, Response } from "express";
import { IApplicationsService } from "../../services/interface/IApplicationsService";
import { IApplicationsControllers } from "../interface/IApplicationsController";
import { StatusCode } from "../../utils/enums";

export class ApplicationsController implements IApplicationsControllers {
    private _applicationsService: IApplicationsService;

    constructor(_applicationsService: IApplicationsService) {
        this._applicationsService = _applicationsService;
    }

    async apply(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body
            const response = await this._applicationsService.apply(payload
            )
            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    status: response.status,
                    message: "Applied Successfully!"
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

    async updateApplicationStatus(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body
            const response = await this._applicationsService.updateApplicationStatus(payload)
            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    message: "Applied Updated!"
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

    async getAllApplications(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 10;
            const querys = (req.query.querys as string) || "";
            const jobId = (req.query.jobId as string) || "";

            const response = await this._applicationsService.getAllApplications({
                page,
                pageSize,
                query: querys,
                jobId
            });

            if (!response) {
                res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Job post not found.",
                });
                return;
            }

            const { applications, totalPages } = response;

            if (applications.length === 0) {
                res.status(StatusCode.OK).json({
                    success: true,
                    message: "No applications found for this job.",
                    applications: [],
                    totalPages: 0,
                });
                return;
            }

            res.status(StatusCode.OK).json({
                success: true,
                applications,
                totalPages,
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async getUserApplications(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 10;
            const querys = (req.query.querys as string) || "";
            const userId = (req.query.userId as string) || "";

            const response = await this._applicationsService.getUserApplications({
                page,
                pageSize,
                query: querys,
                userId
            });

            if (!response) {
                res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "Job post not found.",
                });
                return;
            }

            const { applications, totalPages } = response;

            if (applications.length === 0) {
                res.status(StatusCode.OK).json({
                    success: true,
                    message: "No applications found for this job.",
                    applications: [],
                    totalPages: 0,
                });
                return;
            }

            res.status(StatusCode.OK).json({
                success: true,
                applications,
                totalPages,
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }



}