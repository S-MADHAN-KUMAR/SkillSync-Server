import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: 'employee' | 'candidate' | 'admin';
            };
        }
    }
}

export const authMiddleware = (roles: Array<'employee' | 'candidate' | 'admin'>) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }

        const token = authHeader.split(' ')[1];
        console.log(token)
        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
                id: string;
                role: 'employee' | 'candidate' | 'admin';
            };

            if (!roles.includes(decoded.role)) {
                res.status(403).json({ message: 'Access denied' });
                return;
            }

            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ message: 'Invalid or expired token' });
            return;
        }
    };
};
