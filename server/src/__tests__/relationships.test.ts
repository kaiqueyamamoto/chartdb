import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import {
    registerAndLogin,
    createDiagram,
    makeTable,
    makeRelationship,
} from '../test/helpers';

let cookies: string[];
let diagramId: string;
let table1Id: string;
let table2Id: string;
let field1Id: string;
let field2Id: string;

beforeEach(async () => {
    cookies = await registerAndLogin(app);
    const diagram = await createDiagram(app, cookies);
    diagramId = diagram.id;

    const now = Date.now();
    field1Id = `fld-${now}-1`;
    field2Id = `fld-${now}-2`;

    const t1 = makeTable({
        id: `tbl-${now}-1`,
        name: 'users',
        fields: [
            {
                id: field1Id,
                name: 'id',
                type: { id: 'integer', name: 'integer' },
                primaryKey: true,
                unique: true,
                nullable: false,
                createdAt: now,
            },
        ],
    });
    const t2 = makeTable({
        id: `tbl-${now}-2`,
        name: 'orders',
        fields: [
            {
                id: field2Id,
                name: 'user_id',
                type: { id: 'integer', name: 'integer' },
                primaryKey: false,
                unique: false,
                nullable: true,
                createdAt: now,
            },
        ],
    });

    const r1 = await request(app)
        .post(`/api/diagrams/${diagramId}/tables`)
        .set('Cookie', cookies)
        .send(t1);
    const r2 = await request(app)
        .post(`/api/diagrams/${diagramId}/tables`)
        .set('Cookie', cookies)
        .send(t2);

    table1Id = r1.body.table.id;
    table2Id = r2.body.table.id;
});

const base = () => `/api/diagrams/${diagramId}/relationships`;

describe('GET /api/diagrams/:diagramId/relationships', () => {
    it('returns an empty array when diagram has no relationships', async () => {
        const res = await request(app).get(base()).set('Cookie', cookies);

        expect(res.status).toBe(200);
        expect(res.body.relationships).toEqual([]);
    });

    it('returns all relationships', async () => {
        const rel = makeRelationship(table1Id, table2Id, field1Id, field2Id);
        await request(app).post(base()).set('Cookie', cookies).send(rel);

        const res = await request(app).get(base()).set('Cookie', cookies);

        expect(res.status).toBe(200);
        expect(res.body.relationships).toHaveLength(1);
    });

    it('returns 401 without authentication', async () => {
        const res = await request(app).get(base());
        expect(res.status).toBe(401);
    });
});

describe('POST /api/diagrams/:diagramId/relationships', () => {
    it('adds a relationship and returns it', async () => {
        const rel = makeRelationship(table1Id, table2Id, field1Id, field2Id);

        const res = await request(app)
            .post(base())
            .set('Cookie', cookies)
            .send(rel);

        expect(res.status).toBe(201);
        expect(res.body.relationship).toMatchObject({
            id: rel.id,
            sourceTableId: table1Id,
            targetTableId: table2Id,
            sourceCardinality: 'one',
            targetCardinality: 'many',
        });
    });

    it('returns 400 when sourceCardinality is invalid', async () => {
        const rel = makeRelationship(table1Id, table2Id, field1Id, field2Id, {
            sourceCardinality: 'invalid',
        });

        const res = await request(app)
            .post(base())
            .set('Cookie', cookies)
            .send(rel);

        expect(res.status).toBe(400);
    });

    it('returns 400 when required fields are missing', async () => {
        const res = await request(app)
            .post(base())
            .set('Cookie', cookies)
            .send({ id: 'rel-1', name: 'fk_test' }); // missing cardinalities etc.

        expect(res.status).toBe(400);
    });

    it('returns 401 without authentication', async () => {
        const rel = makeRelationship(table1Id, table2Id, field1Id, field2Id);
        const res = await request(app).post(base()).send(rel);
        expect(res.status).toBe(401);
    });
});

describe('GET /api/diagrams/:diagramId/relationships/:relationshipId', () => {
    it('returns a specific relationship', async () => {
        const rel = makeRelationship(table1Id, table2Id, field1Id, field2Id);
        await request(app).post(base()).set('Cookie', cookies).send(rel);

        const res = await request(app)
            .get(`${base()}/${rel.id}`)
            .set('Cookie', cookies);

        expect(res.status).toBe(200);
        expect(res.body.relationship.id).toBe(rel.id);
    });

    it('returns 404 when relationship does not exist', async () => {
        const res = await request(app)
            .get(`${base()}/ghost-rel`)
            .set('Cookie', cookies);

        expect(res.status).toBe(404);
    });
});

describe('PUT /api/diagrams/:diagramId/relationships/:relationshipId', () => {
    it('updates cardinality', async () => {
        const rel = makeRelationship(table1Id, table2Id, field1Id, field2Id, {
            sourceCardinality: 'one',
        });
        await request(app).post(base()).set('Cookie', cookies).send(rel);

        const res = await request(app)
            .put(`${base()}/${rel.id}`)
            .set('Cookie', cookies)
            .send({ sourceCardinality: 'many' });

        expect(res.status).toBe(200);
        expect(res.body.relationship.sourceCardinality).toBe('many');
    });

    it('returns 404 when relationship does not exist', async () => {
        const res = await request(app)
            .put(`${base()}/ghost-rel`)
            .set('Cookie', cookies)
            .send({ sourceCardinality: 'many' });

        expect(res.status).toBe(404);
    });
});

describe('DELETE /api/diagrams/:diagramId/relationships/:relationshipId', () => {
    it('removes a relationship', async () => {
        const rel = makeRelationship(table1Id, table2Id, field1Id, field2Id);
        await request(app).post(base()).set('Cookie', cookies).send(rel);

        const res = await request(app)
            .delete(`${base()}/${rel.id}`)
            .set('Cookie', cookies);

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/deleted/i);

        const getRes = await request(app)
            .get(`${base()}/${rel.id}`)
            .set('Cookie', cookies);
        expect(getRes.status).toBe(404);
    });

    it('returns 404 when relationship does not exist', async () => {
        const res = await request(app)
            .delete(`${base()}/ghost-rel`)
            .set('Cookie', cookies);

        expect(res.status).toBe(404);
    });
});
