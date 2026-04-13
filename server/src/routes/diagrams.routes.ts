import type { Request, Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { authenticate } from '../middleware/authenticate';
import { Diagram } from '../models/diagram.model';

const router = Router();

// ─── Validation schemas ───────────────────────────────────────────────────────

const createDiagramSchema = z.object({
    id: z.string().min(1, 'ID is required'),
    name: z.string().min(1, 'Name is required').max(255),
    databaseType: z.string().min(1, 'Database type is required'),
    databaseEdition: z.string().optional().nullable(),
    tables: z.array(z.record(z.unknown())).optional().default([]),
    relationships: z.array(z.record(z.unknown())).optional().default([]),
    dependencies: z.array(z.record(z.unknown())).optional().default([]),
    areas: z.array(z.record(z.unknown())).optional().default([]),
    notes: z.array(z.record(z.unknown())).optional().default([]),
    customTypes: z.array(z.record(z.unknown())).optional().default([]),
});

const updateDiagramSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    databaseType: z.string().min(1).optional(),
    databaseEdition: z.string().optional().nullable(),
    tables: z.array(z.record(z.unknown())).optional(),
    relationships: z.array(z.record(z.unknown())).optional(),
    dependencies: z.array(z.record(z.unknown())).optional(),
    areas: z.array(z.record(z.unknown())).optional(),
    notes: z.array(z.record(z.unknown())).optional(),
    customTypes: z.array(z.record(z.unknown())).optional(),
});

// ─── GET /api/diagrams ────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/diagrams:
 *   get:
 *     summary: List all diagrams for the authenticated user
 *     tags: [Diagrams]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of diagrams (metadata only, no tables/relationships)
 *       401:
 *         description: Unauthorized
 */
router.get(
    '/',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const diagrams = await Diagram.find({ userId: req.userId })
            .select(
                '-tables -relationships -dependencies -areas -notes -customTypes'
            )
            .sort({ updatedAt: -1 });

        res.status(200).json({ diagrams });
    }
);

// ─── POST /api/diagrams ───────────────────────────────────────────────────────
/**
 * @swagger
 * /api/diagrams:
 *   post:
 *     summary: Create a new diagram
 *     tags: [Diagrams]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, databaseType]
 *             properties:
 *               name:
 *                 type: string
 *               databaseType:
 *                 type: string
 *               databaseEdition:
 *                 type: string
 *     responses:
 *       201:
 *         description: Diagram created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
    '/',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const parsed = createDiagramSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.errors[0].message });
            return;
        }

        const { id, ...rest } = parsed.data;
        const diagram = await Diagram.create({
            _id: id,
            userId: req.userId,
            ...rest,
        });

        res.status(201).json({ diagram });
    }
);

// ─── GET /api/diagrams/:diagramId ─────────────────────────────────────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}:
 *   get:
 *     summary: Get a diagram with all its data
 *     tags: [Diagrams]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: diagramId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Full diagram data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Diagram not found
 */
router.get(
    '/:diagramId',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const diagram = await Diagram.findOne({
            _id: req.params.diagramId,
            userId: req.userId,
        });

        if (!diagram) {
            res.status(404).json({ error: 'Diagram not found' });
            return;
        }

        res.status(200).json({ diagram });
    }
);

// ─── PUT /api/diagrams/:diagramId ─────────────────────────────────────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}:
 *   put:
 *     summary: Update a diagram (partial or full update)
 *     tags: [Diagrams]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: diagramId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated diagram
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Diagram not found
 */
router.put(
    '/:diagramId',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const parsed = updateDiagramSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.errors[0].message });
            return;
        }

        const diagram = await Diagram.findOneAndUpdate(
            { _id: req.params.diagramId, userId: req.userId },
            { $set: parsed.data },
            { new: true, runValidators: true }
        );

        if (!diagram) {
            res.status(404).json({ error: 'Diagram not found' });
            return;
        }

        res.status(200).json({ diagram });
    }
);

// ─── DELETE /api/diagrams/:diagramId ──────────────────────────────────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}:
 *   delete:
 *     summary: Delete a diagram
 *     tags: [Diagrams]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: diagramId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Diagram deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Diagram not found
 */
router.delete(
    '/:diagramId',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const diagram = await Diagram.findOneAndDelete({
            _id: req.params.diagramId,
            userId: req.userId,
        });

        if (!diagram) {
            res.status(404).json({ error: 'Diagram not found' });
            return;
        }

        res.status(200).json({ message: 'Diagram deleted successfully' });
    }
);

// ─── POST /api/diagrams/:diagramId/clone ──────────────────────────────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}/clone:
 *   post:
 *     summary: Clone a diagram
 *     tags: [Diagrams]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: diagramId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cloned diagram
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Source diagram not found
 */
router.post(
    '/:diagramId/clone',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const source = await Diagram.findOne({
            _id: req.params.diagramId,
            userId: req.userId,
        });

        if (!source) {
            res.status(404).json({ error: 'Diagram not found' });
            return;
        }

        const cloneName: string =
            typeof req.body?.name === 'string' && req.body.name.trim()
                ? req.body.name.trim()
                : `${source.name} (copy)`;

        const cloned = await Diagram.create({
            _id: randomUUID(),
            userId: req.userId,
            name: cloneName,
            databaseType: source.databaseType,
            databaseEdition: source.databaseEdition,
            tables: source.tables,
            relationships: source.relationships,
            dependencies: source.dependencies,
            areas: source.areas,
            notes: source.notes,
            customTypes: source.customTypes,
        });

        res.status(201).json({ diagram: cloned });
    }
);

export { router as diagramsRouter };
