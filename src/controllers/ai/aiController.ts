import { Request } from "express-serve-static-core";
import { IAIService } from "../../services/interface/IAIService";
import { IAIController } from "../interface/IAIController";
import { Response } from "express";
import { StatusCode } from "../../utils/enums";
import { MockInterviewErrorMsg, MockInterviewSuccessMsg } from "../../utils/constants";
import { askGemini, sanitizeGeminiResponse } from "../../utils/gemini";

export class AiController implements IAIController {
    private _aiService: IAIService;
    constructor(_aiService: IAIService) {
        this._aiService = _aiService;
    }

    async createMockInterview(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const payload = req.body
            const response = await this._aiService.createMockInterview(payload, id)
            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    message: MockInterviewSuccessMsg.CREATED,
                    interview: response,
                });
            } else {
                res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: MockInterviewErrorMsg.FAILED_TO_CREATED,
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

    async getMockInterview(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const response = await this._aiService.getMockInterview(id)
            res.status(StatusCode.OK).json({
                success: true,
                interview: response,
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async saveAnswer(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const response = await this._aiService.saveAnswer(req.body, id)
            res.status(StatusCode.OK).json({
                success: true,
                message: MockInterviewSuccessMsg.ANSWER_SAVED,
                data: response,
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async getAllMockInterviews(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 10;
            const querys = (req.query.querys as string) || "";
            const id = (req.query.id as string) || "";
            const { interviews, totalInterviews } = await this._aiService.getAllMockInterviews(page, pageSize, querys, id)
            res.status(StatusCode.OK).json({
                success: true,
                interviews: interviews,
                totalInterviews: totalInterviews && Math.ceil(totalInterviews / pageSize)
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async checkAiAccess(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const result = await this._aiService.checkAiAccess(id);

            if (result) {
                const { user, isHaveAccess } = result;
                res.status(StatusCode.OK).json({
                    success: isHaveAccess,
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

    async removeInterview(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body
            const result = await this._aiService.removeInterview(payload);

            if (result) {
                res.status(StatusCode.OK).json({
                    success: true,
                    message: 'Interview Deleted'
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

    async createInterview(req: Request, res: Response): Promise<void> {
        try {
            const employeeId = req.params.employeeId
            const payload = req.body
            const response = await this._aiService.createInterview(payload, employeeId)
            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    message: MockInterviewSuccessMsg.CREATED,
                    interview: response,
                });
            } else {
                res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: MockInterviewErrorMsg.FAILED_TO_CREATED,
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

    async getAllVoiceInterviews(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 10;
            const querys = (req.query.querys as string) || "";
            const id = (req.query.id as string) || "";
            const { interviews, totalInterviews } = await this._aiService.getAllVoiceInterviews(page, pageSize, querys, id)
            res.status(StatusCode.OK).json({
                success: true,
                interviews: interviews,
                totalInterviews: totalInterviews && Math.ceil(totalInterviews / pageSize)
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
            const response = await this._aiService.getAllCandidates()
            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    users: response
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

    async getInterview(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const response = await this._aiService.getInterview(id)
            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    interview: response
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

    async checkInterviewAccess(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body
            const response = await this._aiService.checkInterviewAccess(payload)
            if (response !== null) {
                res.status(StatusCode.OK).json({
                    success: true,
                    interview: response
                });
            } else {
                res.status(StatusCode.OK).json({
                    success: false,
                    message: "You don'thave access to join the interview !"
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

    async askAnswer(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body

            const response = await this._aiService.inteviewConversation(payload)

            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    message: MockInterviewSuccessMsg.CREATED,
                    answer: response,
                });
            } else {
                res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: MockInterviewErrorMsg.FAILED_TO_CREATED,
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

    async getFeedback(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const response = await this._aiService.getFeedback(id)
            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    interview: response
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

    async removeVoiceInterview(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const response = await this._aiService.removeVoiceInterview({ id })
            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    message: "Interview removed successfully!"
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