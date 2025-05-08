import { Request } from "express-serve-static-core";
import { IAIService } from "../../services/interface/IAIService";
import { IAIController } from "../interface/IAIController";
import { Response } from "express";
import { StatusCode } from "../../utils/enums";
import { MockInterviewSuccessMsg } from "../../utils/constants";

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
            res.status(StatusCode.OK).json({
                success: true,
                message: MockInterviewSuccessMsg.CREATED,
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
}