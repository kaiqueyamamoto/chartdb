import 'dotenv/config';
import type { Request, Response, NextFunction } from 'express';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import { ZodError } from 'zod';
import { authRouter } from './routes/auth.routes';
import { swaggerSpec } from './swagger';

const PORT = process.env.PORT ?? 3001;
const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/chartdb';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';

async function connectDB(): Promise<void> {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
}

const app = express();

app.use(
    cors({
        origin: CLIENT_ORIGIN,
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRouter);

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
});

// Global error handler — 4-param signature required by Express to detect error handlers
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
        res.status(400).json({ error: err.errors[0].message });
        return;
    }

    if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: unknown }).code === 11000
    ) {
        res.status(409).json({ error: 'Duplicate entry' });
        return;
    }

    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(
                `API docs available at http://localhost:${PORT}/api/docs`
            );
        });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    });
