import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { Roles, StatusCode } from '../utils/enums';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: Roles.EMPLOYEE | Roles.CANDIDATE | Roles.ADMIN;
            };
        }
    }
}

export const authMiddleware = (roles: Array<Roles.EMPLOYEE | Roles.CANDIDATE | Roles.ADMIN>) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(StatusCode.UNAUTHORIZED).json({ message: 'No token provided' });
            return;
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
                id: string;
                role: Roles.EMPLOYEE | Roles.CANDIDATE | Roles.ADMIN;
            };


            if (!roles.includes(decoded.role)) {
                res.status(StatusCode.FORBIDDEN).json({ message: 'Access denied' });
                return;
            }

            req.user = decoded;
            next();
        } catch (error) {
            console.error("❌ Token error:", error);
            res.status(StatusCode.UNAUTHORIZED).json({ message: 'Invalid or expired token' });
        }
    };
};
