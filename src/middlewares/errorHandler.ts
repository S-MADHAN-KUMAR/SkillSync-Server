import { NextFunction, Request, Response } from "express";
import { StatusCode } from "../utils/enums";
import { GeneralServerErrorMsg } from "../utils/constants";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error("❌ Error:", err.message);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        error: GeneralServerErrorMsg.INTERNAL_SERVER_ERROR,
        details: err.message,
    });
};
