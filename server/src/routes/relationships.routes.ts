import type { Request, Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate';
import { Diagram } from '../models/diagram.model';

const router = Router({ mergeParams: true });

// ─── Validation ───────────────────────────────────────────────────────────────

const relationshipSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    sourceSchema: z.string().optional().nullable(),
    sourceTableId: z.string().min(1),
    targetSchema: z.string().optional().nullable(),
    targetTableId: z.string().min(1),
    sourceFieldId: z.string().min(1),
    targetFieldId: z.string().min(1),
    sourceCardinality: z.enum(['one', 'many']),
    targetCardinality: z.enum(['one', 'many']),
    createdAt: z.number(),
});

const updateRelationshipSchema = relationshipSchema
    .partial()
    .omit({ id: true, createdAt: true });

// ─── GET /api/diagrams/:diagramId/relationships ───────────────────────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}/relationships:
 *   get:
 *     summary: List all relationships in a diagram
 *     tags: [Relationships]
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
 *         description: List of relationships
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
            { relationships: 1 }
        );

        if (!diagram) {
            res.status(404).json({ error: 'Diagram not found' });
            return;
        }

        res.status(200).json({ relationships: diagram.relationships });
    }
);

// ─── POST /api/diagrams/:diagramId/relationships ──────────────────────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}/relationships:
 *   post:
 *     summary: Add a relationship to a diagram
 *     tags: [Relationships]
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
 *         description: Relationship added
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
        const parsed = relationshipSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.errors[0].message });
            return;
        }

        const diagram = await Diagram.findOneAndUpdate(
            { _id: req.params.diagramId, userId: req.userId },
            { $push: { relationships: parsed.data } },
            { new: true, select: 'relationships' }
        );

        if (!diagram) {
            res.status(404).json({ error: 'Diagram not found' });
            return;
        }

        const added = diagram.relationships.find(
            (r) => r.id === parsed.data.id
        );
        res.status(201).json({ relationship: added });
    }
);

// ─── GET /api/diagrams/:diagramId/relationships/:relationshipId ───────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}/relationships/{relationshipId}:
 *   get:
 *     summary: Get a single relationship
 *     tags: [Relationships]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: diagramId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: relationshipId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Relationship data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.get(
    '/:relationshipId',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const diagram = await Diagram.findOne(
            { _id: req.params.diagramId, userId: req.userId },
            { relationships: 1 }
        );

        if (!diagram) {
            res.status(404).json({ error: 'Diagram not found' });
            return;
        }

        const relationship = diagram.relationships.find(
            (r) => r.id === req.params.relationshipId
        );
        if (!relationship) {
            res.status(404).json({ error: 'Relationship not found' });
            return;
        }

        res.status(200).json({ relationship });
    }
);

// ─── PUT /api/diagrams/:diagramId/relationships/:relationshipId ───────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}/relationships/{relationshipId}:
 *   put:
 *     summary: Update a relationship
 *     tags: [Relationships]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: diagramId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: relationshipId
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
 *         description: Updated relationship
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.put(
    '/:relationshipId',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const parsed = updateRelationshipSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.errors[0].message });
            return;
        }

        const setFields: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(parsed.data)) {
            setFields[`relationships.$.${key}`] = value;
        }

        const diagram = await Diagram.findOneAndUpdate(
            {
                _id: req.params.diagramId,
                userId: req.userId,
                'relationships.id': req.params.relationshipId,
            },
            { $set: setFields },
            { new: true, select: 'relationships' }
        );

        if (!diagram) {
            res.status(404).json({
                error: 'Relationship or diagram not found',
            });
            return;
        }

        const updated = diagram.relationships.find(
            (r) => r.id === req.params.relationshipId
        );
        res.status(200).json({ relationship: updated });
    }
);

// ─── DELETE /api/diagrams/:diagramId/relationships/:relationshipId ────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}/relationships/{relationshipId}:
 *   delete:
 *     summary: Remove a relationship from a diagram
 *     tags: [Relationships]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: diagramId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: relationshipId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Relationship deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.delete(
    '/:relationshipId',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const diagram = await Diagram.findOneAndUpdate(
            { _id: req.params.diagramId, userId: req.userId },
            { $pull: { relationships: { id: req.params.relationshipId } } },
            { new: false }
        );

        if (!diagram) {
            res.status(404).json({ error: 'Diagram not found' });
            return;
        }

        const existed = diagram.relationships.some(
            (r) => r.id === req.params.relationshipId
        );
        if (!existed) {
            res.status(404).json({ error: 'Relationship not found' });
            return;
        }

        res.status(200).json({ message: 'Relationship deleted successfully' });
    }
);

export { router as relationshipsRouter };
