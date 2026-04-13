import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { registerAndLogin, createDiagram, makeDiagram } from '../test/helpers';

let cookies: string[];

beforeEach(async () => {
    cookies = await registerAndLogin(app);
});

describe('GET /api/diagrams', () => {
    it('returns an empty list when the user has no diagrams', async () => {
        const res = await request(app)
            .get('/api/diagrams')
            .set('Cookie', cookies);

        expect(res.status).toBe(200);
        expect(res.body.diagrams).toEqual([]);
    });

    it('returns only the authenticated user diagrams', async () => {
        await createDiagram(app, cookies, { name: 'My Diagram' });

        // Second user should not see the first user's diagrams
        const otherCookies = await registerAndLogin(app, {
            username: 'otheruser',
            email: 'other@example.com',
            password: 'password123',
        });

        const res = await request(app)
            .get('/api/diagrams')
            .set('Cookie', otherCookies);

        expect(res.status).toBe(200);
        expect(res.body.diagrams).toHaveLength(0);
    });

    it('returns metadata only (no tables/relationships)', async () => {
        await createDiagram(app, cookies);

        const res = await request(app)
            .get('/api/diagrams')
            .set('Cookie', cookies);

        expect(res.status).toBe(200);
        expect(res.body.diagrams).toHaveLength(1);

        const diagram = res.body.diagrams[0];
        expect(diagram).not.toHaveProperty('tables');
        expect(diagram).not.toHaveProperty('relationships');
        expect(diagram).toHaveProperty('name');
        expect(diagram).toHaveProperty('databaseType');
    });

    it('returns diagrams sorted by updatedAt descending', async () => {
        await createDiagram(app, cookies, { id: 'diag-1', name: 'First' });
        await createDiagram(app, cookies, { id: 'diag-2', name: 'Second' });

        const res = await request(app)
            .get('/api/diagrams')
            .set('Cookie', cookies);

        expect(res.status).toBe(200);
        expect(res.body.diagrams[0].name).toBe('Second');
        expect(res.body.diagrams[1].name).toBe('First');
    });

    it('returns 401 without authentication', async () => {
        const res = await request(app).get('/api/diagrams');
        expect(res.status).toBe(401);
    });
});

describe('POST /api/diagrams', () => {
    it('creates a diagram and returns it with 201', async () => {
        const body = makeDiagram({
            name: 'New Diagram',
            databaseType: 'mysql',
        });

        const res = await request(app)
            .post('/api/diagrams')
            .set('Cookie', cookies)
            .send(body);

        expect(res.status).toBe(201);
        expect(res.body.diagram).toMatchObject({
            id: body.id,
            name: 'New Diagram',
            databaseType: 'mysql',
        });
        expect(res.body.diagram).toHaveProperty('tables');
        expect(res.body.diagram).toHaveProperty('relationships');
    });

    it('returns 400 when id is missing', async () => {
        const res = await request(app)
            .post('/api/diagrams')
            .set('Cookie', cookies)
            .send({ name: 'No ID', databaseType: 'postgresql' });

        expect(res.status).toBe(400);
    });

    it('returns 400 when name is missing', async () => {
        const res = await request(app)
            .post('/api/diagrams')
            .set('Cookie', cookies)
            .send({ id: 'some-id', databaseType: 'postgresql' });

        expect(res.status).toBe(400);
    });

    it('returns 400 when databaseType is missing', async () => {
        const res = await request(app)
            .post('/api/diagrams')
            .set('Cookie', cookies)
            .send({ id: 'some-id', name: 'No Type' });

        expect(res.status).toBe(400);
    });

    it('returns 401 without authentication', async () => {
        const res = await request(app)
            .post('/api/diagrams')
            .send(makeDiagram());

        expect(res.status).toBe(401);
    });
});

describe('GET /api/diagrams/:diagramId', () => {
    it('returns the full diagram including tables and relationships', async () => {
        const created = await createDiagram(app, cookies, {
            name: 'Full Diagram',
        });

        const res = await request(app)
            .get(`/api/diagrams/${created.id}`)
            .set('Cookie', cookies);

        expect(res.status).toBe(200);
        expect(res.body.diagram).toMatchObject({
            id: created.id,
            name: 'Full Diagram',
        });
        expect(res.body.diagram).toHaveProperty('tables');
        expect(res.body.diagram).toHaveProperty('relationships');
        expect(res.body.diagram).toHaveProperty('areas');
        expect(res.body.diagram).toHaveProperty('notes');
    });

    it('returns 404 for a non-existent diagram', async () => {
        const res = await request(app)
            .get('/api/diagrams/non-existent-id')
            .set('Cookie', cookies);

        expect(res.status).toBe(404);
    });

    it('returns 404 when diagram belongs to another user', async () => {
        const created = await createDiagram(app, cookies);

        const otherCookies = await registerAndLogin(app, {
            username: 'otheruser',
            email: 'other@example.com',
            password: 'password123',
        });

        const res = await request(app)
            .get(`/api/diagrams/${created.id}`)
            .set('Cookie', otherCookies);

        expect(res.status).toBe(404);
    });

    it('returns 401 without authentication', async () => {
        const created = await createDiagram(app, cookies);
        const res = await request(app).get(`/api/diagrams/${created.id}`);
        expect(res.status).toBe(401);
    });
});

describe('PUT /api/diagrams/:diagramId', () => {
    it('updates diagram name', async () => {
        const created = await createDiagram(app, cookies, { name: 'Original' });

        const res = await request(app)
            .put(`/api/diagrams/${created.id}`)
            .set('Cookie', cookies)
            .send({ name: 'Updated' });

        expect(res.status).toBe(200);
        expect(res.body.diagram.name).toBe('Updated');
    });

    it('updates databaseType', async () => {
        const created = await createDiagram(app, cookies, {
            databaseType: 'mysql',
        });

        const res = await request(app)
            .put(`/api/diagrams/${created.id}`)
            .set('Cookie', cookies)
            .send({ databaseType: 'postgresql' });

        expect(res.status).toBe(200);
        expect(res.body.diagram.databaseType).toBe('postgresql');
    });

    it('returns 404 for a non-existent diagram', async () => {
        const res = await request(app)
            .put('/api/diagrams/ghost-id')
            .set('Cookie', cookies)
            .send({ name: 'Ghost' });

        expect(res.status).toBe(404);
    });

    it('returns 401 without authentication', async () => {
        const created = await createDiagram(app, cookies);
        const res = await request(app)
            .put(`/api/diagrams/${created.id}`)
            .send({ name: 'No Auth' });

        expect(res.status).toBe(401);
    });
});

describe('DELETE /api/diagrams/:diagramId', () => {
    it('deletes a diagram and returns success message', async () => {
        const created = await createDiagram(app, cookies);

        const res = await request(app)
            .delete(`/api/diagrams/${created.id}`)
            .set('Cookie', cookies);

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/deleted/i);

        // Verify it's gone
        const getRes = await request(app)
            .get(`/api/diagrams/${created.id}`)
            .set('Cookie', cookies);
        expect(getRes.status).toBe(404);
    });

    it('returns 404 for a non-existent diagram', async () => {
        const res = await request(app)
            .delete('/api/diagrams/ghost-id')
            .set('Cookie', cookies);

        expect(res.status).toBe(404);
    });

    it('returns 401 without authentication', async () => {
        const created = await createDiagram(app, cookies);
        const res = await request(app).delete(`/api/diagrams/${created.id}`);
        expect(res.status).toBe(401);
    });
});

describe('POST /api/diagrams/:diagramId/clone', () => {
    it('clones the diagram with a default copy name', async () => {
        const source = await createDiagram(app, cookies, { name: 'Original' });

        const res = await request(app)
            .post(`/api/diagrams/${source.id}/clone`)
            .set('Cookie', cookies);

        expect(res.status).toBe(201);
        expect(res.body.diagram.name).toBe('Original (copy)');
        expect(res.body.diagram.id).not.toBe(source.id);
        expect(res.body.diagram.databaseType).toBe(source.databaseType);
    });

    it('clones with a custom name when provided', async () => {
        const source = await createDiagram(app, cookies, { name: 'Original' });

        const res = await request(app)
            .post(`/api/diagrams/${source.id}/clone`)
            .set('Cookie', cookies)
            .send({ name: 'My Clone' });

        expect(res.status).toBe(201);
        expect(res.body.diagram.name).toBe('My Clone');
    });

    it('returns 404 when source diagram does not exist', async () => {
        const res = await request(app)
            .post('/api/diagrams/ghost-id/clone')
            .set('Cookie', cookies);

        expect(res.status).toBe(404);
    });

    it('returns 401 without authentication', async () => {
        const source = await createDiagram(app, cookies);
        const res = await request(app).post(`/api/diagrams/${source.id}/clone`);
        expect(res.status).toBe(401);
    });
});
