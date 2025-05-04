import { Request, Response } from "express";
import { ICandidateService } from "../../services/interface/ICandidateService";
import { ICandidateControllers } from "../interface/ICandidateController";
import { StatusCode } from "../../utils/enums";
import { UserSuccessMessages } from "../../utils/constants";
import { uploadFileToCloudinary } from "../../utils/uploadToCloudinary";
import { log } from "console";

export class CandidateController implements ICandidateControllers {
    private _candidateService: ICandidateService;
    constructor(_candidateService: ICandidateService) {
        this._candidateService = _candidateService;
    }

    async updateOrCreate(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body;
            const id = req.params.id

            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            let logoUrl = '';
            let bannerUrl = '';
            let resumeUrl = '';


            if (files.logo && files.logo[0]) {
                const logoFile = files.logo[0];
                if (logoFile.mimetype.startsWith('image/')) {
                    logoUrl = await uploadFileToCloudinary(logoFile.buffer, 'image', 'logo_images');
                } else if (logoFile.mimetype === 'application/pdf') {
                    logoUrl = await uploadFileToCloudinary(logoFile.buffer, 'pdf', 'pdf_files');
                } else {
                    throw new Error('Invalid file type for logo. Only image or PDF is allowed.');
                }
            }

            if (files.banner && files.banner[0]) {
                const bannerFile = files.banner[0];
                if (bannerFile.mimetype.startsWith('image/')) {
                    bannerUrl = await uploadFileToCloudinary(bannerFile.buffer, 'image', 'banner_images');
                } else if (bannerFile.mimetype === 'application/pdf') {
                    bannerUrl = await uploadFileToCloudinary(bannerFile.buffer, 'pdf', 'pdf_files');
                } else {
                    throw new Error('Invalid file type for banner. Only image or PDF is allowed.');
                }
            }

            if (files.resume && files.resume[0]) {
                const resumeFile = files.resume[0];
                if (resumeFile.mimetype.startsWith('image/')) {
                    resumeUrl = await uploadFileToCloudinary(resumeFile.buffer, 'image', 'resume_images');
                } else if (resumeFile.mimetype === 'application/pdf') {
                    resumeUrl = await uploadFileToCloudinary(resumeFile.buffer, 'pdf', 'pdf_files');
                } else {
                    throw new Error('Invalid file type for resume. Only image or PDF is allowed.');
                }
            }

            if (payload.logo && !logoUrl) {
                logoUrl = payload.logo;
            }
            if (payload.banner && !bannerUrl) {
                bannerUrl = payload.banner;
            }
            if (payload.resume && !resumeUrl) {
                resumeUrl = payload.resume;
            }

            payload.logo = logoUrl;
            payload.banner = bannerUrl;
            payload.resume = resumeUrl;
            payload.userId = id
            const { response, user } = await this._candidateService.updateOrCreate(payload, id);
            res.status(StatusCode.OK).json({
                success: true,
                message: UserSuccessMessages.USER_CREATED,
                user: user,
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async getCandidateProfile(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const response = await this._candidateService.getCandidateProfile(id)
            res.status(StatusCode.OK).json({
                success: true,
                candidates: response,
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