import { Request, Response } from "express";
import { ICandidateService } from "../../services/interface/ICandidateService";
import { ICandidateControllers } from "../interface/ICandidateController";
import { StatusCode } from "../../utils/enums";
import { UserSuccessMessages } from "../../utils/constants";
import { uploadFileToCloudinary } from "../../utils/uploadToCloudinary";

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
                user
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
            const payload = req.body

            console.log(payload)

            const response = await this._candidateService.getCandidateProfile(payload)
            res.status(StatusCode.OK).json({
                success: true,
                candidate: response,
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async getAllCandidates(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 10;
            const query = (req.query.querys as string) || "";
            const location = (req.query.location as string) || "";
            const omit = (req.query.omit as string) || "";
            const userId = (req.query.userId as string) || "";
            const { candidates, totalCandidates } = await this._candidateService.getAllCandidates(page,
                pageSize,
                query,
                location,
                omit,
                userId)
            res.status(StatusCode.OK).json({
                success: true,
                candidates: candidates,
                totalCandidates,
                totalPages: Math.ceil(totalCandidates / pageSize),
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

    async getAllSavedJobs(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 10;
            const querys = (req.query.querys as string) || "";
            const id = (req.query.id as string) || "";
            const response = await this._candidateService.getAllSavedJobs({
                page,
                pageSize,
                querys,
                id
            })
            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    jobs: response?.jobs,
                    totalJobs: response?.totalJobs,
                    totalPages: response?.totalJobs && Math.ceil(response?.totalJobs / pageSize),
                })
            } else {
                res.status(StatusCode.OK).json({
                    success: false,
                    message: "Failed to get saved job posts"
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

    async saveJob(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body
            const response = await this._candidateService.saveJob(payload)
            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    message: "Job Post Saved"
                })
            } else {
                res.status(StatusCode.OK).json({
                    success: false,
                    message: "Failed to save"
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

    async removeSavedJob(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const response = await this._candidateService.removeSaveJob(id)
            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    message: "Job Post Removed"
                })
            } else {
                res.status(StatusCode.OK).json({
                    success: false,
                    message: "Failed to remove job post"
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

    async getStatistics(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const response = await this._candidateService.getStatistics(id)
            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    response
                })
            } else {
                res.status(StatusCode.OK).json({
                    success: false,
                    message: "Failed to get"
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

    async getConnectedUsers(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;

            const connectedUsers = await this._candidateService.getConnectedUsers(id);

            if (connectedUsers) {
                res.status(StatusCode.OK).json({
                    success: true,
                    connectedUsers,
                });
            } else {
                res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "No connected candidates found.",
                });
            }
        } catch (error) {
            console.error("Error in getConnectedUsers:", (error as Error).message);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to retrieve connected users.",
            });
        }
    }

    async messageTo(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body;
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            let imageUrls: string[] = [];

            // Handle image files from multipart/form-data
            if (files?.images) {
                for (const file of files.images) {
                    if (file.mimetype.startsWith('image/')) {
                        const url = await uploadFileToCloudinary(file.buffer, 'image', 'message_images');
                        imageUrls.push(url);
                    } else {
                        res.status(StatusCode.BAD_REQUEST).json({
                            success: false,
                            message: 'Only image files are allowed in the "images" field.'
                        });
                    }
                }
            }

            // If frontend also sends image URLs in body (e.g., from another source)
            if (payload.images) {
                const parsedUrls = typeof payload.images === 'string'
                    ? JSON.parse(payload.images)
                    : payload.images;
                imageUrls = [...imageUrls, ...parsedUrls];
            }

            const response = await this._candidateService.messageTo({
                senderId: payload.senderId,
                recipientId: payload.recipientId,
                content: payload.content,
                imageUrls
            });

            if (response) {
                res.status(StatusCode.OK).json({ success: true });
            } else {
                res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: "Failed to send message!"
                });
            }

        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
            console.error('❌ Error sending message:', err.message);
        }
    }

    async getMessages(req: Request, res: Response): Promise<void> {
        try {
            const { senderId, recipientId } = req.body;

            if (!senderId || !recipientId) {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Both senderId and recipientId are required."
                });
            }

            const messages = await this._candidateService.getMessages({ senderId, recipientId });

            if (messages) {
                res.status(StatusCode.OK).json({
                    success: true,
                    messages
                });
            } else {
                res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "No messages found."
                });
            }
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: err.message,
            });
            console.error('❌ Error fetching messages:', err.message);
        }
    }

    async getUnSeenMessageCount(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;

            const messages = await this._candidateService.getUnSeenMessageCount(id);

            if (messages) {
                res.status(StatusCode.OK).json({
                    success: true,
                    count: messages
                });
            } else {
                res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "No messages found."
                });
            }
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: err.message,
            });
            console.error('❌ Error fetching messages:', err.message);
        }
    }

    async removeMessage(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;

            const messages = await this._candidateService.removeMessage(id);

            if (messages) {
                res.status(StatusCode.OK).json({
                    success: true,
                    message: "Message removed!"
                });
            } else {
                res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "No messages found."
                });
            }
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: err.message,
            });
            console.error('❌ Error fetching messages:', err.message);
        }
    }

    async updateSeen(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;

            const messages = await this._candidateService.updateSeen(id);

            if (messages) {
                res.status(StatusCode.OK).json({
                    success: true
                });
            } else {
                res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "No messages found."
                });
            }
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: err.message,
            });
            console.error('❌ Error fetching messages:', err.message);
        }
    }

    async updateEditMessage(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body

            const messages = await this._candidateService.updateEditMessage(payload);

            if (messages) {
                res.status(StatusCode.OK).json({
                    success: true
                });
            } else {
                res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "No messages found."
                });
            }
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: err.message,
            });
            console.error('❌ Error fetching messages:', err.message);
        }
    }

}