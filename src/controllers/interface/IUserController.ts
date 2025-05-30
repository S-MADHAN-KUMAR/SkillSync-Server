import { Request, Response } from "express";

export interface IUserController {
    register(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<void>;
    getUserWithEmail(req: Request, res: Response): Promise<void>
    googleAuth(req: Request, res: Response): Promise<void>
    otpVerify(req: Request, res: Response): Promise<void>
    forgotEmail(req: Request, res: Response): Promise<void>
    forgotOtpVerify(req: Request, res: Response): Promise<void>
    resetPassword(req: Request, res: Response): Promise<void>
    resetOtp(req: Request, res: Response): Promise<void>
    logout(req: Request, res: Response): Promise<void>
    refreshToken(req: Request, res: Response): Promise<void>
    getSavedCandidates(req: Request, res: Response): Promise<void>
    saveCandidate(req: Request, res: Response): Promise<void>
    removeSavedCandidate(req: Request, res: Response): Promise<void>
}