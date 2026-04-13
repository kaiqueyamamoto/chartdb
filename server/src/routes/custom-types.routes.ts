import type { Request, Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate';
import { Diagram } from '../models/diagram.model';

const router = Router({ mergeParams: true });

// ─── Validation ───────────────────────────────────────────────────────────────

const customTypeSchema = z.object({
    id: z.string(),
    schema: z.string().optional().nullable(),
    name: z.string().min(1),
    kind: z.enum(['enum', 'composite']),
    values: z.array(z.string()).optional().nullable(),
    fields: z
        .array(
            z.object({
                field: z.string().min(1),
                type: z.string().min(1),
            })
        )
        .optional()
        .nullable(),
    order: z.number().optional().nullable(),
});

const updateCustomTypeSchema = customTypeSchema.partial().omit({ id: true });

// ─── GET /api/diagrams/:diagramId/custom-types ────────────────────────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}/custom-types:
 *   get:
 *     summary: List all custom types in a diagram
 *     tags: [CustomTypes]
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
 *         description: List of custom types
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
            { customTypes: 1 }
        );

        if (!diagram) {
            res.status(404).json({ error: 'Diagram not found' });
            return;
        }

        res.status(200).json({ customTypes: diagram.customTypes });
    }
);

// ─── POST /api/diagrams/:diagramId/custom-types ───────────────────────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}/custom-types:
 *   post:
 *     summary: Add a custom type to a diagram
 *     tags: [CustomTypes]
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
 *             required: [id, name, kind]
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               kind:
 *                 type: string
 *                 enum: [enum, composite]
 *               values:
 *                 type: array
 *                 items:
 *                   type: string
 *               fields:
 *                 type: array
 *     responses:
 *       201:
 *         description: Custom type added
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
        const parsed = customTypeSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.errors[0].message });
            return;
        }

        const diagram = await Diagram.findOneAndUpdate(
            { _id: req.params.diagramId, userId: req.userId },
            { $push: { customTypes: parsed.data } },
            { new: true, select: 'customTypes' }
        );

        if (!diagram) {
            res.status(404).json({ error: 'Diagram not found' });
            return;
        }

        const added = diagram.customTypes.find(
            (ct) => ct.id === parsed.data.id
        );
        res.status(201).json({ customType: added });
    }
);

// ─── PUT /api/diagrams/:diagramId/custom-types/:typeId ────────────────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}/custom-types/{typeId}:
 *   put:
 *     summary: Update a custom type
 *     tags: [CustomTypes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: diagramId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: typeId
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
 *         description: Updated custom type
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.put(
    '/:typeId',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const parsed = updateCustomTypeSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.errors[0].message });
            return;
        }

        const setFields: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(parsed.data)) {
            setFields[`customTypes.$.${key}`] = value;
        }

        const diagram = await Diagram.findOneAndUpdate(
            {
                _id: req.params.diagramId,
                userId: req.userId,
                'customTypes.id': req.params.typeId,
            },
            { $set: setFields },
            { new: true, select: 'customTypes' }
        );

        if (!diagram) {
            res.status(404).json({ error: 'Custom type or diagram not found' });
            return;
        }

        const updated = diagram.customTypes.find(
            (ct) => ct.id === req.params.typeId
        );
        res.status(200).json({ customType: updated });
    }
);

// ─── DELETE /api/diagrams/:diagramId/custom-types/:typeId ─────────────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}/custom-types/{typeId}:
 *   delete:
 *     summary: Remove a custom type from a diagram
 *     tags: [CustomTypes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: diagramId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: typeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Custom type deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.delete(
    '/:typeId',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const diagram = await Diagram.findOneAndUpdate(
            { _id: req.params.diagramId, userId: req.userId },
            { $pull: { customTypes: { id: req.params.typeId } } },
            { new: false }
        );

        if (!diagram) {
            res.status(404).json({ error: 'Diagram not found' });
            return;
        }

        const existed = diagram.customTypes.some(
            (ct) => ct.id === req.params.typeId
        );
        if (!existed) {
            res.status(404).json({ error: 'Custom type not found' });
            return;
        }

        res.status(200).json({ message: 'Custom type deleted successfully' });
    }
);

export { router as customTypesRouter };
