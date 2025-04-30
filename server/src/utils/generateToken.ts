import dotenv from 'dotenv';
import jwt, { SignOptions } from 'jsonwebtoken';
import { HttpError } from './httpError';
import { StatusCode } from './enums';


dotenv.config();

type ExpiresInString = `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y'}`;

export const candidateGenerateToken = (email: string): string => {
    const tokenKey = process.env.CANDIDATE_TOKEN;
    const expiresIn = (process.env.JWT_EXPIRES_IN || '30d') as ExpiresInString;

    if (!tokenKey) {
        throw new HttpError(
            'CANDIDATE_TOKEN is not defined in environment variables',
            StatusCode.BAD_REQUEST
        );
    }

    const payload = {
        email,
        role: 'candidate'
    };

    const options: SignOptions = {
        expiresIn
    };

    return jwt.sign(payload, tokenKey, options);
};

export const recruiterGenerateToken = (email: string): string => {
    const tokenKey = process.env.RECRUITER_TOKEN;
    const expiresIn = (process.env.JWT_EXPIRES_IN || '30d') as ExpiresInString;

    if (!tokenKey) {
        throw new HttpError(
            'RESCRUITER_TOKEN is not defined in environment variables',
            StatusCode.BAD_REQUEST
        );
    }

    const payload = {
        email,
        role: 'recruiter'
    };

    const options: SignOptions = {
        expiresIn
    };

    return jwt.sign(payload, tokenKey, options);
};

export const adminGenerateToken = (email: string): string => {
    const tokenKey = process.env.ADMIN_TOKEN;
    const expiresIn = (process.env.JWT_EXPIRES_IN || '30d') as ExpiresInString;

    if (!tokenKey) {
        throw new HttpError(
            'ADMIN_TOKEN is not defined in environment variables',
            StatusCode.BAD_REQUEST
        );
    }

    const payload = {
        email,
        role: 'admin'
    };

    const options: SignOptions = {
        expiresIn
    };

    return jwt.sign(payload, tokenKey, options);
};


export const userGenerateToken = (email: string, role: string): string => {
    const tokenKey = process.env.USER_TOKEN;
    const expiresIn = (process.env.JWT_EXPIRES_IN || '30d') as ExpiresInString;

    if (!tokenKey) {
        throw new HttpError(
            'RESCRUITER_TOKEN is not defined in environment variables',
            StatusCode.BAD_REQUEST
        );
    }

    const payload = {
        email,
        role: role
    };

    const options: SignOptions = {
        expiresIn
    };

    return jwt.sign(payload, tokenKey, options);
};