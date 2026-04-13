import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import {
    registerAndLogin,
    createDiagram,
    makeArea,
    makeNote,
    makeCustomType,
} from '../test/helpers';

let cookies: string[];
let diagramId: string;

beforeEach(async () => {
    cookies = await registerAndLogin(app);
    const diagram = await createDiagram(app, cookies);
    diagramId = diagram.id;
});

// ─── Areas ────────────────────────────────────────────────────────────────────

describe('Areas /api/diagrams/:diagramId/areas', () => {
    const base = () => `/api/diagrams/${diagramId}/areas`;

    it('GET returns empty list initially', async () => {
        const res = await request(app).get(base()).set('Cookie', cookies);
        expect(res.status).toBe(200);
        expect(res.body.areas).toEqual([]);
    });

    it('POST creates an area', async () => {
        const area = makeArea({ name: 'Auth Module' });

        const res = await request(app)
            .post(base())
            .set('Cookie', cookies)
            .send(area);

        expect(res.status).toBe(201);
        expect(res.body.area).toMatchObject({
            id: area.id,
            name: 'Auth Module',
            width: area.width,
            height: area.height,
        });
    });

    it('POST returns 400 when required fields are missing', async () => {
        const res = await request(app)
            .post(base())
            .set('Cookie', cookies)
            .send({ id: 'area-1', name: 'Bad' }); // missing x, y, width, height, color

        expect(res.status).toBe(400);
    });

    it('GET /:areaId returns the area', async () => {
        const area = makeArea({ name: 'Section A' });
        await request(app).post(base()).set('Cookie', cookies).send(area);

        const res = await request(app)
            .get(`${base()}/${area.id}`)
            .set('Cookie', cookies);

        expect(res.status).toBe(200);
        expect(res.body.area.name).toBe('Section A');
    });

    it('GET /:areaId returns 404 when not found', async () => {
        const res = await request(app)
            .get(`${base()}/ghost-area`)
            .set('Cookie', cookies);

        expect(res.status).toBe(404);
    });

    it('PUT /:areaId updates the area name', async () => {
        const area = makeArea({ name: 'Old Name' });
        await request(app).post(base()).set('Cookie', cookies).send(area);

        const res = await request(app)
            .put(`${base()}/${area.id}`)
            .set('Cookie', cookies)
            .send({ name: 'New Name' });

        expect(res.status).toBe(200);
        expect(res.body.area.name).toBe('New Name');
    });

    it('DELETE /:areaId removes the area', async () => {
        const area = makeArea();
        await request(app).post(base()).set('Cookie', cookies).send(area);

        const res = await request(app)
            .delete(`${base()}/${area.id}`)
            .set('Cookie', cookies);

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/deleted/i);

        const getRes = await request(app)
            .get(`${base()}/${area.id}`)
            .set('Cookie', cookies);
        expect(getRes.status).toBe(404);
    });

    it('returns 401 without authentication', async () => {
        const res = await request(app).get(base());
        expect(res.status).toBe(401);
    });
});

// ─── Notes ────────────────────────────────────────────────────────────────────

describe('Notes /api/diagrams/:diagramId/notes', () => {
    const base = () => `/api/diagrams/${diagramId}/notes`;

    it('GET returns empty list initially', async () => {
        const res = await request(app).get(base()).set('Cookie', cookies);
        expect(res.status).toBe(200);
        expect(res.body.notes).toEqual([]);
    });

    it('POST creates a note', async () => {
        const note = makeNote({ content: 'Remember to index this column' });

        const res = await request(app)
            .post(base())
            .set('Cookie', cookies)
            .send(note);

        expect(res.status).toBe(201);
        expect(res.body.note).toMatchObject({
            id: note.id,
            content: 'Remember to index this column',
        });
    });

    it('POST returns 400 when required fields are missing', async () => {
        const res = await request(app)
            .post(base())
            .set('Cookie', cookies)
            .send({ id: 'note-1' }); // missing content, x, y, width, height, color

        expect(res.status).toBe(400);
    });

    it('GET /:noteId returns the note', async () => {
        const note = makeNote({ content: 'My note' });
        await request(app).post(base()).set('Cookie', cookies).send(note);

        const res = await request(app)
            .get(`${base()}/${note.id}`)
            .set('Cookie', cookies);

        expect(res.status).toBe(200);
        expect(res.body.note.content).toBe('My note');
    });

    it('GET /:noteId returns 404 when not found', async () => {
        const res = await request(app)
            .get(`${base()}/ghost-note`)
            .set('Cookie', cookies);

        expect(res.status).toBe(404);
    });

    it('PUT /:noteId updates note content', async () => {
        const note = makeNote({ content: 'Old content' });
        await request(app).post(base()).set('Cookie', cookies).send(note);

        const res = await request(app)
            .put(`${base()}/${note.id}`)
            .set('Cookie', cookies)
            .send({ content: 'New content' });

        expect(res.status).toBe(200);
        expect(res.body.note.content).toBe('New content');
    });

    it('DELETE /:noteId removes the note', async () => {
        const note = makeNote();
        await request(app).post(base()).set('Cookie', cookies).send(note);

        const res = await request(app)
            .delete(`${base()}/${note.id}`)
            .set('Cookie', cookies);

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/deleted/i);

        const getRes = await request(app)
            .get(`${base()}/${note.id}`)
            .set('Cookie', cookies);
        expect(getRes.status).toBe(404);
    });

    it('returns 401 without authentication', async () => {
        const res = await request(app).get(base());
        expect(res.status).toBe(401);
    });
});

// ─── Custom Types ─────────────────────────────────────────────────────────────

describe('Custom Types /api/diagrams/:diagramId/custom-types', () => {
    const base = () => `/api/diagrams/${diagramId}/custom-types`;

    it('GET returns empty list initially', async () => {
        const res = await request(app).get(base()).set('Cookie', cookies);
        expect(res.status).toBe(200);
        expect(res.body.customTypes).toEqual([]);
    });

    it('POST creates an enum custom type', async () => {
        const ct = makeCustomType({
            name: 'user_status',
            kind: 'enum',
            values: ['active', 'inactive', 'banned'],
        });

        const res = await request(app)
            .post(base())
            .set('Cookie', cookies)
            .send(ct);

        expect(res.status).toBe(201);
        expect(res.body.customType).toMatchObject({
            id: ct.id,
            name: 'user_status',
            kind: 'enum',
        });
        expect(res.body.customType.values).toEqual(
            expect.arrayContaining(['active', 'inactive', 'banned'])
        );
    });

    it('POST creates a composite custom type', async () => {
        const ct = makeCustomType({
            name: 'address',
            kind: 'composite',
            values: null,
            fields: [
                { field: 'street', type: 'text' },
                { field: 'city', type: 'text' },
            ],
        });

        const res = await request(app)
            .post(base())
            .set('Cookie', cookies)
            .send(ct);

        expect(res.status).toBe(201);
        expect(res.body.customType.kind).toBe('composite');
        expect(res.body.customType.fields).toHaveLength(2);
    });

    it('POST returns 400 when kind is invalid', async () => {
        const ct = makeCustomType({ kind: 'invalid_kind' });

        const res = await request(app)
            .post(base())
            .set('Cookie', cookies)
            .send(ct);

        expect(res.status).toBe(400);
    });

    it('GET /:typeId returns the custom type', async () => {
        const ct = makeCustomType({ name: 'order_status' });
        await request(app).post(base()).set('Cookie', cookies).send(ct);

        const res = await request(app)
            .get(`${base()}/${ct.id}`)
            .set('Cookie', cookies);

        expect(res.status).toBe(200);
        expect(res.body.customType.name).toBe('order_status');
    });

    it('GET /:typeId returns 404 when not found', async () => {
        const res = await request(app)
            .get(`${base()}/ghost-type`)
            .set('Cookie', cookies);

        expect(res.status).toBe(404);
    });

    it('PUT /:typeId updates the custom type', async () => {
        const ct = makeCustomType({
            name: 'status',
            kind: 'enum',
            values: ['on', 'off'],
        });
        await request(app).post(base()).set('Cookie', cookies).send(ct);

        const res = await request(app)
            .put(`${base()}/${ct.id}`)
            .set('Cookie', cookies)
            .send({ values: ['on', 'off', 'pending'] });

        expect(res.status).toBe(200);
        expect(res.body.customType.values).toHaveLength(3);
    });

    it('DELETE /:typeId removes the custom type', async () => {
        const ct = makeCustomType();
        await request(app).post(base()).set('Cookie', cookies).send(ct);

        const res = await request(app)
            .delete(`${base()}/${ct.id}`)
            .set('Cookie', cookies);

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/deleted/i);

        const getRes = await request(app)
            .get(`${base()}/${ct.id}`)
            .set('Cookie', cookies);
        expect(getRes.status).toBe(404);
    });

    it('returns 401 without authentication', async () => {
        const res = await request(app).get(base());
        expect(res.status).toBe(401);
    });
});
