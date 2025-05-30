import jwt from 'jsonwebtoken';

interface TokenPayload {
    id?: string;
    role: 'employee' | 'candidate' | 'admin';
}

export const generateTokens = (payload: TokenPayload) => {
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
