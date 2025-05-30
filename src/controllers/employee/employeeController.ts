import { Request, Response } from "express";
import { IEmployeeService } from "../../services/interface/IEmployeeService";
import { IEmployeeController } from "../interface/IEmployeeController";
import { StatusCode } from "../../utils/enums";
import { JobPost, JobPostErrorMessages, UserSuccessMessages } from "../../utils/constants";
import { uploadFileToCloudinary } from "../../utils/uploadToCloudinary";

export class EmployeeController implements IEmployeeController {
    private _employeeService: IEmployeeService;
    constructor(_employeeService: IEmployeeService) {
        this._employeeService = _employeeService;
    }

    async updateOrCreate(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body;
            const id = req.params.id;
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            let logoUrl = '';
            let bannerUrl = '';

            if (files.logo && files.logo[0] && !(payload.logo && payload.logo.startsWith(process.env.CLOUDINARY_URL))) {
                const logoFile = files.logo[0];
                if (logoFile.mimetype.startsWith('image/')) {
                    logoUrl = await uploadFileToCloudinary(logoFile.buffer, 'image', 'logo_images');
                } else if (logoFile.mimetype === 'application/pdf') {
                    logoUrl = await uploadFileToCloudinary(logoFile.buffer, 'pdf', 'pdf_files');
                } else {
                    throw new Error('Invalid file type for logo. Only image or PDF is allowed.');
                }
            } else if (payload.logo) {
                logoUrl = payload.logo;
            }

            if (files.banner && files.banner[0] && !(payload.banner && payload.banner.startsWith(process.env.CLOUDINARY_URL))) {
                const bannerFile = files.banner[0];
                if (bannerFile.mimetype.startsWith('image/')) {
                    bannerUrl = await uploadFileToCloudinary(bannerFile.buffer, 'image', 'banner_images');
                } else if (bannerFile.mimetype === 'application/pdf') {
                    bannerUrl = await uploadFileToCloudinary(bannerFile.buffer, 'pdf', 'pdf_files');
                } else {
                    throw new Error('Invalid file type for banner. Only image or PDF is allowed.');
                }
            } else if (payload.banner) {
                bannerUrl = payload.banner;
            }

            payload.logo = logoUrl;
            payload.banner = bannerUrl;

            const { response, userData } = await this._employeeService.updateOrCreate(payload, id);

            res.status(StatusCode.OK).json({
                success: true,
                message: UserSuccessMessages.USER_UPDATED,
                employee: userData,
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async getEmployeeProfile(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const employee = await this._employeeService.getEmployeeProfile(id)
            res.status(StatusCode.OK).json({
                success: true,
                employee,
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async createJob(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body
            const response = await this._employeeService.createJob(payload)
            if (!response) {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: JobPostErrorMessages.JOB_FAILD_TO_CREATE
                });
            }
            res.status(StatusCode.OK).json({
                success: true,
                message: JobPost.JOB_CREATED
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async updateJob(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body
            const id = req.params.id
            const response = await this._employeeService.updateJob(payload, id)
            if (!response) {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: JobPostErrorMessages.JOB_FAILD_TO_CREATE
                });
            }
            res.status(StatusCode.OK).json({
                success: true,
                message: JobPost.JOB_UPDATED
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async getAllJobs(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 10;
            const query = (req.query.querys as string) || "";
            const location = (req.query.location as string) || "";
            const jobType = (req.query.jobType as string) || "";
            const salary = (req.query.salary as string) || "";
            const id = (req.query.id as string) || "";
            const skill = (req.query.skill as string) || "";
            const active = req.query.active !== undefined ? req.query.active === 'true' : undefined;
            const expiredBefore = req.query.expiredBefore
                ? new Date(req.query.expiredBefore as string)
                : undefined;
            const { jobs, totalJobs } = await this._employeeService.getAllJobs(
                page,
                pageSize,
                query,
                id,              // user ID
                location,
                jobType,
                salary,
                skill,
                active,
                expiredBefore
            );

            res.status(StatusCode.OK).json({
                success: true,
                jobs,
                totalJobs,
                totalPages: Math.ceil(totalJobs / pageSize),
                currentPage: page,
            });
        } catch (error) {
            const err = error as Error;
            console.error('Error fetching jobs:', err.message);

            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async getRecentJobs(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const response = await this._employeeService.getRecentJobs(id)
            res.status(StatusCode.OK).json({
                success: true,
                jobs: response
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
            console.log('Error:', err.message);
        }
    }

    async editJob(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const payload = req.body
            await this._employeeService.editJob(id, payload)
            res.status(StatusCode.OK).json({
                success: true,
                message: JobPost.JOB_UPDATED
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async getJob(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body
            const job = await this._employeeService.getJob(payload)
            res.status(StatusCode.OK).json({
                success: true,
                job: job,
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async getJobs(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 10;
            const query = (req.query.querys as string) || "";
            const location = (req.query.location as string) || "";
            const jobType = (req.query.jobType as string) || "";
            const salary = (req.query.salary as string) || "";
            const { jobs, totalJobs } = await this._employeeService.getJobs(id, page,
                pageSize,
                query,
                location,
                jobType,
                salary)
            res.status(StatusCode.OK).json({
                success: true,
                jobs: jobs,
                totalJobs,
                totalPages: Math.ceil(totalJobs / pageSize),
                currentPage: page,
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async getAllEmployees(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 10;
            const query = (req.query.querys as string) || "";
            const location = (req.query.location as string) || "";
            const omit = (req.query.omit as string) || "";

            const { employees, totalEmployees } = await this._employeeService.getAllEmployees(page,
                pageSize,
                query,
                location, omit)
            res.status(StatusCode.OK).json({
                success: true,
                employees,
                totalEmployees,
                totalPages: Math.ceil(totalEmployees / pageSize),
                currentPage: page,
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
            const id = req.params.id
            const status = req.body.status
            console.log('...............', status);

            const response = await this._employeeService.toggleStatus(id, status)
            res.status(StatusCode.OK).json({
                success: true,
                message: status ? JobPost.JOB_REMOVED : JobPost.JOB_RECOVERD

            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async getEmployeeDetail(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id

            const response = await this._employeeService.getEmployeeDetail(id)
            res.status(StatusCode.OK).json({
                success: true,
                employee: response

            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async getStatistics(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id

            const response = await this._employeeService.getStatistics(id)
            res.status(StatusCode.OK).json({
                success: true,
                result: response
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