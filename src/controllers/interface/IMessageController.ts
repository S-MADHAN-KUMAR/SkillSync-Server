import { Response, Request } from "express";

export interface IMessageController {
    getUserMessages(req: Request, res: Response): Promise<void>
}