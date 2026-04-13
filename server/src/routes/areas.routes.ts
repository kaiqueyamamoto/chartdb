import type { Request, Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate';
import { Diagram } from '../models/diagram.model';

const router = Router({ mergeParams: true });

// ─── Validation ───────────────────────────────────────────────────────────────

const areaSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    x: z.number(),
    y: z.number(),
    width: z.number().positive(),
    height: z.number().positive(),
    color: z.string(),
    order: z.number().optional(),
});

const updateAreaSchema = areaSchema.partial().omit({ id: true });

// ─── GET /api/diagrams/:diagramId/areas ───────────────────────────────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}/areas:
 *   get:
 *     summary: List all areas in a diagram
 *     tags: [Areas]
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
 *         description: List of areas
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Diagram not found
 */
router.get(
    '/',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const diagram = await Diagram.findOne(
            { _id: req.params.diagramId, userId: req.userId },
            { areas: 1 }
        );

        if (!diagram) {
            res.status(404).json({ error: 'Diagram not found' });
            return;
        }

        res.status(200).json({ areas: diagram.areas });
    }
);

// ─── POST /api/diagrams/:diagramId/areas ──────────────────────────────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}/areas:
 *   post:
 *     summary: Add an area to a diagram
 *     tags: [Areas]
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
 *       201:
 *         description: Area added
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Diagram not found
 */
router.post(
    '/',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const parsed = areaSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.errors[0].message });
            return;
        }

        const diagram = await Diagram.findOneAndUpdate(
            { _id: req.params.diagramId, userId: req.userId },
            { $push: { areas: parsed.data } },
            { new: true, select: 'areas' }
        );

        if (!diagram) {
            res.status(404).json({ error: 'Diagram not found' });
            return;
        }

        const added = diagram.areas.find((a) => a.id === parsed.data.id);
        res.status(201).json({ area: added });
    }
);

// ─── PUT /api/diagrams/:diagramId/areas/:areaId ───────────────────────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}/areas/{areaId}:
 *   put:
 *     summary: Update an area
 *     tags: [Areas]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: diagramId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: areaId
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
 *         description: Updated area
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.put(
    '/:areaId',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const parsed = updateAreaSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.errors[0].message });
            return;
        }

        const setFields: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(parsed.data)) {
            setFields[`areas.$.${key}`] = value;
        }

        const diagram = await Diagram.findOneAndUpdate(
            {
                _id: req.params.diagramId,
                userId: req.userId,
                'areas.id': req.params.areaId,
            },
            { $set: setFields },
            { new: true, select: 'areas' }
        );

        if (!diagram) {
            res.status(404).json({ error: 'Area or diagram not found' });
            return;
        }

        const updated = diagram.areas.find((a) => a.id === req.params.areaId);
        res.status(200).json({ area: updated });
    }
);

// ─── DELETE /api/diagrams/:diagramId/areas/:areaId ────────────────────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}/areas/{areaId}:
 *   delete:
 *     summary: Remove an area from a diagram
 *     tags: [Areas]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: diagramId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: areaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Area deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.delete(
    '/:areaId',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const diagram = await Diagram.findOneAndUpdate(
            { _id: req.params.diagramId, userId: req.userId },
            { $pull: { areas: { id: req.params.areaId } } },
            { new: false }
        );

        if (!diagram) {
            res.status(404).json({ error: 'Diagram not found' });
            return;
        }

        const existed = diagram.areas.some((a) => a.id === req.params.areaId);
        if (!existed) {
            res.status(404).json({ error: 'Area not found' });
            return;
        }

        res.status(200).json({ message: 'Area deleted successfully' });
    }
);

export { router as areasRouter };
