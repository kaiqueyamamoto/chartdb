import type { Response } from 'express';
import { signAccessToken, signRefreshToken } from './jwt';

const isProduction = process.env.NODE_ENV === 'production';

const cookieBase = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProduction,
    path: '/',
};

export function setAuthCookies(res: Response, userId: string): void {
    const accessToken = signAccessToken(userId);
    const refreshToken = signRefreshToken(userId);

    res.cookie('access_token', accessToken, {
        ...cookieBase,
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
        ...cookieBase,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
}

export function clearAuthCookies(res: Response): void {
    res.cookie('access_token', '', { ...cookieBase, maxAge: 0 });
    res.cookie('refresh_token', '', { ...cookieBase, maxAge: 0 });
}
