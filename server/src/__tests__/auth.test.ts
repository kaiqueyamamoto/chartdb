import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { defaultUser, registerAndLogin } from '../test/helpers';

describe('POST /api/auth/register', () => {
    it('creates a user and returns user data with auth cookies', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(defaultUser);

        expect(res.status).toBe(201);
        expect(res.body.user).toMatchObject({
            username: defaultUser.username,
            email: defaultUser.email,
        });
        expect(res.body.user).not.toHaveProperty('passwordHash');

        const cookies = res.headers['set-cookie'] as string[];
        expect(cookies.some((c: string) => c.startsWith('access_token='))).toBe(
            true
        );
        expect(
            cookies.some((c: string) => c.startsWith('refresh_token='))
        ).toBe(true);
    });

    it('returns 400 when username is too short', async () => {
        const res = await request(app).post('/api/auth/register').send({
            username: 'ab',
            email: 'x@x.com',
            password: 'password123',
        });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('returns 400 when email is invalid', async () => {
        const res = await request(app).post('/api/auth/register').send({
            username: 'validuser',
            email: 'not-an-email',
            password: 'password123',
        });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('returns 400 when password is too short', async () => {
        const res = await request(app).post('/api/auth/register').send({
            username: 'validuser',
            email: 'x@x.com',
            password: '1234567',
        });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('returns 409 when email is already in use', async () => {
        await request(app).post('/api/auth/register').send(defaultUser);

        const res = await request(app)
            .post('/api/auth/register')
            .send({ ...defaultUser, username: 'otheruser' });

        expect(res.status).toBe(409);
        expect(res.body.error).toMatch(/email/i);
    });

    it('returns 409 when username is already taken', async () => {
        await request(app).post('/api/auth/register').send(defaultUser);

        const res = await request(app)
            .post('/api/auth/register')
            .send({ ...defaultUser, email: 'other@example.com' });

        expect(res.status).toBe(409);
        expect(res.body.error).toMatch(/username/i);
    });
});

describe('POST /api/auth/login', () => {
    it('returns user and auth cookies on valid credentials', async () => {
        await request(app).post('/api/auth/register').send(defaultUser);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: defaultUser.email, password: defaultUser.password });

        expect(res.status).toBe(200);
        expect(res.body.user).toMatchObject({
            username: defaultUser.username,
            email: defaultUser.email,
        });
        expect(res.body.user).not.toHaveProperty('passwordHash');

        const cookies = res.headers['set-cookie'] as string[];
        expect(cookies.some((c: string) => c.startsWith('access_token='))).toBe(
            true
        );
    });

    it('returns 401 on wrong password', async () => {
        await request(app).post('/api/auth/register').send(defaultUser);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: defaultUser.email, password: 'wrongpassword' });

        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/invalid credentials/i);
    });

    it('returns 401 when user does not exist', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nobody@example.com', password: 'password123' });

        expect(res.status).toBe(401);
    });

    it('returns 400 when email is missing', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ password: 'password123' });

        expect(res.status).toBe(400);
    });
});

describe('GET /api/auth/me', () => {
    it('returns the authenticated user', async () => {
        const cookies = await registerAndLogin(app);

        const res = await request(app)
            .get('/api/auth/me')
            .set('Cookie', cookies);

        expect(res.status).toBe(200);
        expect(res.body.user).toMatchObject({
            username: defaultUser.username,
            email: defaultUser.email,
        });
        expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('returns 401 when not authenticated', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
    });

    it('returns 401 with invalid token', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Cookie', ['access_token=invalid.token.here']);

        expect(res.status).toBe(401);
    });
});

describe('POST /api/auth/logout', () => {
    it('clears auth cookies', async () => {
        const cookies = await registerAndLogin(app);

        const res = await request(app)
            .post('/api/auth/logout')
            .set('Cookie', cookies);

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/logged out/i);

        const setCookies = res.headers['set-cookie'] as string[];
        const accessCleared = setCookies.some(
            (c: string) =>
                c.startsWith('access_token=') &&
                c.includes('Expires=Thu, 01 Jan 1970')
        );
        expect(accessCleared).toBe(true);
    });
});

describe('POST /api/auth/refresh', () => {
    it('issues new tokens from a valid refresh token', async () => {
        const cookies = await registerAndLogin(app);
        const refreshCookie = cookies.find((c: string) =>
            c.startsWith('refresh_token=')
        );

        const res = await request(app)
            .post('/api/auth/refresh')
            .set('Cookie', [refreshCookie!]);

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/token refreshed/i);

        const setCookies = res.headers['set-cookie'] as string[];
        expect(
            setCookies.some((c: string) => c.startsWith('access_token='))
        ).toBe(true);
    });

    it('returns 401 when no refresh token is provided', async () => {
        const res = await request(app).post('/api/auth/refresh');
        expect(res.status).toBe(401);
    });

    it('returns 401 with an invalid refresh token', async () => {
        const res = await request(app)
            .post('/api/auth/refresh')
            .set('Cookie', ['refresh_token=bad.token']);

        expect(res.status).toBe(401);
    });
});

describe('GET /api/health', () => {
    it('returns status ok', async () => {
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: 'ok' });
    });
});
