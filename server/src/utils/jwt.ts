import jwt from 'jsonwebtoken';

interface TokenPayload {
    sub: string;
}

function getSecret(key: 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET'): string {
    const secret = process.env[key];
    if (!secret) throw new Error(`Missing env variable: ${key}`);
    return secret;
}

export function signAccessToken(userId: string): string {
    return jwt.sign({ sub: userId }, getSecret('JWT_ACCESS_SECRET'), {
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ??
            '15m') as jwt.SignOptions['expiresIn'],
    });
}

export function signRefreshToken(userId: string): string {
    return jwt.sign({ sub: userId }, getSecret('JWT_REFRESH_SECRET'), {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ??
            '7d') as jwt.SignOptions['expiresIn'],
    });
}

export function verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, getSecret('JWT_ACCESS_SECRET')) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, getSecret('JWT_REFRESH_SECRET')) as TokenPayload;
}
