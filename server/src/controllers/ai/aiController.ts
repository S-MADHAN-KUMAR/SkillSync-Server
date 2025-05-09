import { Request } from "express-serve-static-core";
import { IAIService } from "../../services/interface/IAIService";
import { IAIController } from "../interface/IAIController";
import { Response } from "express";
import { StatusCode } from "../../utils/enums";
import { MockInterviewErrorMsg, MockInterviewSuccessMsg } from "../../utils/constants";

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
            const id = req.params.id
            const response = await this._aiService.getAllMockInterviews(id)
            res.status(StatusCode.OK).json({
                success: true,
                interviews: response,
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