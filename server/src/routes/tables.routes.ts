import type { Request, Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate';
import { Diagram } from '../models/diagram.model';

// Merged into /api/diagrams/:diagramId/tables via mergeParams
const router = Router({ mergeParams: true });

// ─── Validation ───────────────────────────────────────────────────────────────

const dbFieldSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    type: z.record(z.unknown()),
    primaryKey: z.boolean().default(false),
    unique: z.boolean().default(false),
    nullable: z.boolean().default(true),
    increment: z.boolean().optional().nullable(),
    isArray: z.boolean().optional().nullable(),
    createdAt: z.number(),
    characterMaximumLength: z.string().optional().nullable(),
    precision: z.number().optional().nullable(),
    scale: z.number().optional().nullable(),
    default: z.string().optional().nullable(),
    collation: z.string().optional().nullable(),
    comments: z.string().optional().nullable(),
    check: z.string().optional().nullable(),
});

const dbIndexSchema = z.object({
    id: z.string(),
    name: z.string(),
    unique: z.boolean().default(false),
    fieldIds: z.array(z.string()),
    createdAt: z.number(),
    type: z.string().optional().nullable(),
    isPrimaryKey: z.boolean().optional().nullable(),
    comments: z.string().optional().nullable(),
});

const tableSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    schema: z.string().optional().nullable(),
    x: z.number(),
    y: z.number(),
    fields: z.array(dbFieldSchema).default([]),
    indexes: z.array(dbIndexSchema).default([]),
    checkConstraints: z.array(z.record(z.unknown())).optional().nullable(),
    color: z.string(),
    isView: z.boolean().default(false),
    isMaterializedView: z.boolean().optional().nullable(),
    createdAt: z.number(),
    width: z.number().optional().nullable(),
    comments: z.string().optional().nullable(),
    order: z.number().optional().nullable(),
    expanded: z.boolean().optional().nullable(),
    parentAreaId: z.string().optional().nullable(),
});

const updateTableSchema = tableSchema
    .partial()
    .omit({ id: true, createdAt: true });

// ─── GET /api/diagrams/:diagramId/tables ──────────────────────────────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}/tables:
 *   get:
 *     summary: List all tables in a diagram
 *     tags: [Tables]
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
 *         description: List of tables
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
            { tables: 1 }
        );

        if (!diagram) {
            res.status(404).json({ error: 'Diagram not found' });
            return;
        }

        res.status(200).json({ tables: diagram.tables });
    }
);

// ─── POST /api/diagrams/:diagramId/tables ─────────────────────────────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}/tables:
 *   post:
 *     summary: Add a table to a diagram
 *     tags: [Tables]
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
 *         description: Table added
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
        const parsed = tableSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.errors[0].message });
            return;
        }

        const diagram = await Diagram.findOneAndUpdate(
            { _id: req.params.diagramId, userId: req.userId },
            { $push: { tables: parsed.data } },
            { new: true, select: 'tables' }
        );

        if (!diagram) {
            res.status(404).json({ error: 'Diagram not found' });
            return;
        }

        const added = diagram.tables.find((t) => t.id === parsed.data.id);
        res.status(201).json({ table: added });
    }
);

// ─── GET /api/diagrams/:diagramId/tables/:tableId ────────────────────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}/tables/{tableId}:
 *   get:
 *     summary: Get a single table
 *     tags: [Tables]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: diagramId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Table data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Table or diagram not found
 */
router.get(
    '/:tableId',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const diagram = await Diagram.findOne(
            { _id: req.params.diagramId, userId: req.userId },
            { tables: 1 }
        );

        if (!diagram) {
            res.status(404).json({ error: 'Diagram not found' });
            return;
        }

        const table = diagram.tables.find((t) => t.id === req.params.tableId);
        if (!table) {
            res.status(404).json({ error: 'Table not found' });
            return;
        }

        res.status(200).json({ table });
    }
);

// ─── PUT /api/diagrams/:diagramId/tables/:tableId ────────────────────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}/tables/{tableId}:
 *   put:
 *     summary: Update a table
 *     tags: [Tables]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: diagramId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: tableId
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
 *         description: Updated table
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Table or diagram not found
 */
router.put(
    '/:tableId',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const parsed = updateTableSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.errors[0].message });
            return;
        }

        const setFields: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(parsed.data)) {
            setFields[`tables.$.${key}`] = value;
        }

        const diagram = await Diagram.findOneAndUpdate(
            {
                _id: req.params.diagramId,
                userId: req.userId,
                'tables.id': req.params.tableId,
            },
            { $set: setFields },
            { new: true, select: 'tables' }
        );

        if (!diagram) {
            res.status(404).json({ error: 'Table or diagram not found' });
            return;
        }

        const updated = diagram.tables.find((t) => t.id === req.params.tableId);
        res.status(200).json({ table: updated });
    }
);

// ─── DELETE /api/diagrams/:diagramId/tables/:tableId ─────────────────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}/tables/{tableId}:
 *   delete:
 *     summary: Remove a table from a diagram
 *     tags: [Tables]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: diagramId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: tableId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Table deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Table or diagram not found
 */
router.delete(
    '/:tableId',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const diagram = await Diagram.findOneAndUpdate(
            { _id: req.params.diagramId, userId: req.userId },
            { $pull: { tables: { id: req.params.tableId } } },
            { new: false }
        );

        if (!diagram) {
            res.status(404).json({ error: 'Diagram not found' });
            return;
        }

        const existed = diagram.tables.some((t) => t.id === req.params.tableId);
        if (!existed) {
            res.status(404).json({ error: 'Table not found' });
            return;
        }

        res.status(200).json({ message: 'Table deleted successfully' });
    }
);

export { router as tablesRouter };
