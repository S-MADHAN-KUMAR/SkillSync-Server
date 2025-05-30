import { Request, Response } from "express";
import { IConnectionsService } from "../../services/interface/IConnectionsService";
import { StatusCode } from "../../utils/enums";
import { IConnectionsController } from "../interface/IConnectionsController";

export class ConnectionsController implements IConnectionsController {
    private _connectionsService: IConnectionsService;

    constructor(_connectionsService: IConnectionsService) {
        this._connectionsService = _connectionsService;
    }

    async request(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body;
            const result = await this._connectionsService.request(payload);
            if (result) {
                res.status(StatusCode.OK).json({
                    success: true,
                });
            } else {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Connection already exists or request failed.",
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

    async update(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const result = await this._connectionsService.makeAllRead(id);
            if (result) {
                res.status(StatusCode.OK).json({
                    success: true,
                });
            } else {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Connection already exists or request failed.",
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
            console.log(payload);

            const result = await this._connectionsService.accept(payload);
            if (result) {
                res.status(StatusCode.OK).json({
                    success: true,
                });
            } else {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Connection already exists or request failed.",
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
            const result = await this._connectionsService.cancel(payload);
            if (result) {
                res.status(StatusCode.OK).json({
                    success: true,
                });
            } else {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Connection already exists or request failed.",
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

    async disconnect(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body;

            const result = await this._connectionsService.disconnect(payload);
            if (result) {
                res.status(StatusCode.OK).json({
                    success: true,
                });
            } else {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Connection already exists or request failed.",
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
