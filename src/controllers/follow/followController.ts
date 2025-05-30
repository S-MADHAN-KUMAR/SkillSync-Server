import { Request, Response } from "express";
import { IFollowService } from "../../services/interface/IFollowService";
import { IFollowController } from "../interface/IFollowController";
import { StatusCode } from "../../utils/enums";

export class FollowController implements IFollowController {
    private _followService: IFollowService;
    constructor(_followService: IFollowService) {
        this._followService = _followService;
    }

    async request(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body;
            const result = await this._followService.request(payload);
            if (result) {
                res.status(StatusCode.OK).json({
                    success: true,
                });
            } else {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Follow already exists or request failed.",
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

    async accept(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body;
            console.log('req.body', req.body);

            const result = await this._followService.accept(payload);
            if (result) {
                res.status(StatusCode.OK).json({
                    success: true,
                });
            } else {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Follow already exists or request failed.",
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

    async cancel(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body;
            console.log('req.body', req.body);

            const result = await this._followService.cancel(payload);
            if (result) {
                res.status(StatusCode.OK).json({
                    success: true,
                });
            } else {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Follow already exists or request failed.",
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

    async unfollow(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body;
            console.log('req.body', req.body);

            const result = await this._followService.unfollow(payload);
            if (result) {
                res.status(StatusCode.OK).json({
                    success: true,
                });
            } else {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Follow already exists or request failed.",
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