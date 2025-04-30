import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const adminAuth = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Token extracted:', token);

    if (!token) {
        res.status(401).json({ message: 'Unauthorized: Token not found' });
        return;
    }

    jwt.verify(token, process.env.ADMIN_TOKEN as string, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                res.status(403).json({ message: 'Forbidden: Token expired' });
                return;
            }
            res.status(403).json({ message: 'Forbidden: Invalid token' });
            return;
        }
        next();
    });
};
