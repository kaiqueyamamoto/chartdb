import type { Request, Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate';
import { Diagram } from '../models/diagram.model';

const router = Router({ mergeParams: true });

// ─── Validation ───────────────────────────────────────────────────────────────

const noteSchema = z.object({
    id: z.string(),
    content: z.string(),
    x: z.number(),
    y: z.number(),
    width: z.number().positive(),
    height: z.number().positive(),
    color: z.string(),
    order: z.number().optional(),
});

const updateNoteSchema = noteSchema.partial().omit({ id: true });

// ─── GET /api/diagrams/:diagramId/notes ───────────────────────────────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}/notes:
 *   get:
 *     summary: List all notes in a diagram
 *     tags: [Notes]
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
 *         description: List of notes
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
            { notes: 1 }
        );

        if (!diagram) {
            res.status(404).json({ error: 'Diagram not found' });
            return;
        }

        res.status(200).json({ notes: diagram.notes });
    }
);

// ─── POST /api/diagrams/:diagramId/notes ──────────────────────────────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}/notes:
 *   post:
 *     summary: Add a note to a diagram
 *     tags: [Notes]
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
 *         description: Note added
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
        const parsed = noteSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.errors[0].message });
            return;
        }

        const diagram = await Diagram.findOneAndUpdate(
            { _id: req.params.diagramId, userId: req.userId },
            { $push: { notes: parsed.data } },
            { new: true, select: 'notes' }
        );

        if (!diagram) {
            res.status(404).json({ error: 'Diagram not found' });
            return;
        }

        const added = diagram.notes.find((n) => n.id === parsed.data.id);
        res.status(201).json({ note: added });
    }
);

// ─── PUT /api/diagrams/:diagramId/notes/:noteId ───────────────────────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}/notes/{noteId}:
 *   put:
 *     summary: Update a note
 *     tags: [Notes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: diagramId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: noteId
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
 *         description: Updated note
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.put(
    '/:noteId',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const parsed = updateNoteSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.errors[0].message });
            return;
        }

        const setFields: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(parsed.data)) {
            setFields[`notes.$.${key}`] = value;
        }

        const diagram = await Diagram.findOneAndUpdate(
            {
                _id: req.params.diagramId,
                userId: req.userId,
                'notes.id': req.params.noteId,
            },
            { $set: setFields },
            { new: true, select: 'notes' }
        );

        if (!diagram) {
            res.status(404).json({ error: 'Note or diagram not found' });
            return;
        }

        const updated = diagram.notes.find((n) => n.id === req.params.noteId);
        res.status(200).json({ note: updated });
    }
);

// ─── DELETE /api/diagrams/:diagramId/notes/:noteId ────────────────────────────
/**
 * @swagger
 * /api/diagrams/{diagramId}/notes/{noteId}:
 *   delete:
 *     summary: Remove a note from a diagram
 *     tags: [Notes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: diagramId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.delete(
    '/:noteId',
    authenticate,
    async (req: Request, res: Response): Promise<void> => {
        const diagram = await Diagram.findOneAndUpdate(
            { _id: req.params.diagramId, userId: req.userId },
            { $pull: { notes: { id: req.params.noteId } } },
            { new: false }
        );

        if (!diagram) {
            res.status(404).json({ error: 'Diagram not found' });
            return;
        }

        const existed = diagram.notes.some((n) => n.id === req.params.noteId);
        if (!existed) {
            res.status(404).json({ error: 'Note not found' });
            return;
        }

        res.status(200).json({ message: 'Note deleted successfully' });
    }
);

export { router as notesRouter };
