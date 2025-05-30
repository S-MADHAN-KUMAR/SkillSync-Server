"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const enums_1 = require("../utils/enums");
const authMiddleware = (roles) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(enums_1.StatusCode.UNAUTHORIZED).json({ message: 'No token provided' });
            return;
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
            if (!roles.includes(decoded.role)) {
                res.status(enums_1.StatusCode.FORBIDDEN).json({ message: 'Access denied' });
                return;
            }
            req.user = decoded;
            next();
        }
        catch (error) {
            console.error("❌ Token error:", error);
            res.status(enums_1.StatusCode.UNAUTHORIZED).json({ message: 'Invalid or expired token' });
        }
    };
};
exports.authMiddleware = authMiddleware;
