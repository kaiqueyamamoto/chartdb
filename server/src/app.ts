import type { Request, Response, NextFunction } from 'express';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { ZodError } from 'zod';
import { authRouter } from './routes/auth.routes';
import { diagramsRouter } from './routes/diagrams.routes';
import { tablesRouter } from './routes/tables.routes';
import { relationshipsRouter } from './routes/relationships.routes';
import { areasRouter } from './routes/areas.routes';
import { notesRouter } from './routes/notes.routes';
import { customTypesRouter } from './routes/custom-types.routes';
import { swaggerSpec } from './swagger';

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';

export const app = express();

app.use(
    cors({
        origin: CLIENT_ORIGIN,
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());

// ─── Auth routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);

// ─── Diagram routes ───────────────────────────────────────────────────────────
app.use('/api/diagrams', diagramsRouter);

// ─── Nested resource routes (mergeParams enabled on each router) ──────────────
app.use('/api/diagrams/:diagramId/tables', tablesRouter);
app.use('/api/diagrams/:diagramId/relationships', relationshipsRouter);
app.use('/api/diagrams/:diagramId/areas', areasRouter);
app.use('/api/diagrams/:diagramId/notes', notesRouter);
app.use('/api/diagrams/:diagramId/custom-types', customTypesRouter);

// ─── Swagger UI ───────────────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
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
