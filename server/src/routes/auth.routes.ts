import type { Request, Response } from 'express';
import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { User } from '../models/user.model';
import { authenticate } from '../middleware/authenticate';
import { setAuthCookies, clearAuthCookies } from '../utils/set-auth-cookies';
import { verifyRefreshToken } from '../utils/jwt';

const router = Router();

const registerSchema = z.object({
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be at most 30 characters')
        .regex(
            /^[a-zA-Z0-9_]+$/,
            'Username can only contain letters, numbers and underscores'
        ),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
    }

    const { username, email, password } = parsed.data;

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
        res.status(409).json({ error: 'Email already in use' });
        return;
    }

    const existingUsername = await User.findOne({
        username: { $regex: new RegExp(`^${username}$`, 'i') },
    });
    if (existingUsername) {
        res.status(409).json({ error: 'Username already taken' });
        return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, passwordHash });

    setAuthCookies(res, String(user._id));

    res.status(201).json({
        user: { id: user._id, username: user.username, email: user.email },
    });
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }

    setAuthCookies(res, String(user._id));

    res.status(200).json({
        user: { id: user._id, username: user.username, email: user.email },
    });
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response): void => {
    clearAuthCookies(res);
    res.status(200).json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get(
    '/me',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const user = await User.findById(req.userId, { passwordHash: 0 });
        if (!user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        res.status(200).json({
            user: { id: user._id, username: user.username, email: user.email },
        });
    }
);

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
    const token: string | undefined = req.cookies?.refresh_token;

    if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const payload = verifyRefreshToken(token);
        const user = await User.findById(payload.sub);

        if (!user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        setAuthCookies(res, String(user._id));
        res.status(200).json({ message: 'Token refreshed' });
    } catch {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

export { router as authRouter };
