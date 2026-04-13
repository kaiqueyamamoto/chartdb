import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { registerAndLogin, createDiagram, makeTable } from '../test/helpers';

let cookies: string[];
let diagramId: string;

beforeEach(async () => {
    cookies = await registerAndLogin(app);
    const diagram = await createDiagram(app, cookies);
    diagramId = diagram.id;
});

const base = () => `/api/diagrams/${diagramId}/tables`;

describe('GET /api/diagrams/:diagramId/tables', () => {
    it('returns an empty array when the diagram has no tables', async () => {
        const res = await request(app).get(base()).set('Cookie', cookies);

        expect(res.status).toBe(200);
        expect(res.body.tables).toEqual([]);
    });

    it('returns all tables after adding one', async () => {
        const table = makeTable({ name: 'users' });
        await request(app).post(base()).set('Cookie', cookies).send(table);

        const res = await request(app).get(base()).set('Cookie', cookies);

        expect(res.status).toBe(200);
        expect(res.body.tables).toHaveLength(1);
        expect(res.body.tables[0].name).toBe('users');
    });

    it('returns 404 when diagram does not exist', async () => {
        const res = await request(app)
            .get('/api/diagrams/ghost/tables')
            .set('Cookie', cookies);

        expect(res.status).toBe(404);
    });

    it('returns 401 without authentication', async () => {
        const res = await request(app).get(base());
        expect(res.status).toBe(401);
    });
});

describe('POST /api/diagrams/:diagramId/tables', () => {
    it('adds a table to the diagram', async () => {
        const table = makeTable({ name: 'orders' });

        const res = await request(app)
            .post(base())
            .set('Cookie', cookies)
            .send(table);

        expect(res.status).toBe(201);
        expect(res.body.table).toMatchObject({
            id: table.id,
            name: 'orders',
        });
        expect(res.body.table.fields).toHaveLength(1);
    });

    it('returns 400 when required fields are missing', async () => {
        const res = await request(app)
            .post(base())
            .set('Cookie', cookies)
            .send({ id: 'tbl-1', name: 'bad' }); // missing x, y, color, createdAt

        expect(res.status).toBe(400);
    });

    it('returns 404 when diagram does not exist', async () => {
        const table = makeTable();

        const res = await request(app)
            .post('/api/diagrams/ghost/tables')
            .set('Cookie', cookies)
            .send(table);

        expect(res.status).toBe(404);
    });

    it('returns 401 without authentication', async () => {
        const res = await request(app).post(base()).send(makeTable());
        expect(res.status).toBe(401);
    });
});

describe('GET /api/diagrams/:diagramId/tables/:tableId', () => {
    it('returns a specific table by id', async () => {
        const table = makeTable({ name: 'products' });
        await request(app).post(base()).set('Cookie', cookies).send(table);

        const res = await request(app)
            .get(`${base()}/${table.id}`)
            .set('Cookie', cookies);

        expect(res.status).toBe(200);
        expect(res.body.table.name).toBe('products');
    });

    it('returns 404 when table does not exist', async () => {
        const res = await request(app)
            .get(`${base()}/ghost-table`)
            .set('Cookie', cookies);

        expect(res.status).toBe(404);
    });
});

describe('PUT /api/diagrams/:diagramId/tables/:tableId', () => {
    it('updates table name', async () => {
        const table = makeTable({ name: 'old_name' });
        await request(app).post(base()).set('Cookie', cookies).send(table);

        const res = await request(app)
            .put(`${base()}/${table.id}`)
            .set('Cookie', cookies)
            .send({ name: 'new_name' });

        expect(res.status).toBe(200);
        expect(res.body.table.name).toBe('new_name');
    });

    it('updates table position', async () => {
        const table = makeTable({ x: 0, y: 0 });
        await request(app).post(base()).set('Cookie', cookies).send(table);

        const res = await request(app)
            .put(`${base()}/${table.id}`)
            .set('Cookie', cookies)
            .send({ x: 500, y: 300 });

        expect(res.status).toBe(200);
        expect(res.body.table.x).toBe(500);
        expect(res.body.table.y).toBe(300);
    });

    it('returns 404 when table does not exist', async () => {
        const res = await request(app)
            .put(`${base()}/ghost-table`)
            .set('Cookie', cookies)
            .send({ name: 'x' });

        expect(res.status).toBe(404);
    });
});

describe('DELETE /api/diagrams/:diagramId/tables/:tableId', () => {
    it('removes a table from the diagram', async () => {
        const table = makeTable();
        await request(app).post(base()).set('Cookie', cookies).send(table);

        const res = await request(app)
            .delete(`${base()}/${table.id}`)
            .set('Cookie', cookies);

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/deleted/i);

        // Verify it's gone
        const getRes = await request(app)
            .get(`${base()}/${table.id}`)
            .set('Cookie', cookies);
        expect(getRes.status).toBe(404);
    });

    it('returns 404 when table does not exist', async () => {
        const res = await request(app)
            .delete(`${base()}/ghost-table`)
            .set('Cookie', cookies);

        expect(res.status).toBe(404);
    });
});
