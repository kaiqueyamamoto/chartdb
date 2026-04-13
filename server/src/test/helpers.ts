import request from 'supertest';
import type { Express } from 'express';

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export interface UserCredentials {
    username: string;
    email: string;
    password: string;
}

export const defaultUser: UserCredentials = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
};

/**
 * Registers a user and returns the Set-Cookie header for subsequent requests.
 */
export async function registerAndLogin(
    app: Express,
    credentials: UserCredentials = defaultUser
): Promise<string[]> {
    const res = await request(app).post('/api/auth/register').send(credentials);

    if (res.status !== 201) {
        throw new Error(`Registration failed: ${JSON.stringify(res.body)}`);
    }

    const cookies = res.headers['set-cookie'] as string[] | undefined;
    if (!cookies?.length) throw new Error('No cookies returned after register');
    return cookies;
}

/**
 * Logs in an existing user and returns the Set-Cookie header.
 */
export async function login(
    app: Express,
    credentials: Pick<UserCredentials, 'email' | 'password'>
): Promise<string[]> {
    const res = await request(app).post('/api/auth/login').send(credentials);

    if (res.status !== 200) {
        throw new Error(`Login failed: ${JSON.stringify(res.body)}`);
    }

    const cookies = res.headers['set-cookie'] as string[] | undefined;
    if (!cookies?.length) throw new Error('No cookies returned after login');
    return cookies;
}

// ─── Diagram factories ────────────────────────────────────────────────────────

export function makeDiagram(overrides: Record<string, unknown> = {}) {
    return {
        id: `diag-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: 'Test Diagram',
        databaseType: 'postgresql',
        ...overrides,
    };
}

export async function createDiagram(
    app: Express,
    cookies: string[],
    overrides: Record<string, unknown> = {}
) {
    const body = makeDiagram(overrides);
    const res = await request(app)
        .post('/api/diagrams')
        .set('Cookie', cookies)
        .send(body);

    if (res.status !== 201) {
        throw new Error(`Create diagram failed: ${JSON.stringify(res.body)}`);
    }

    return res.body.diagram as {
        id: string;
        name: string;
        databaseType: string;
    };
}

// ─── Sub-resource factories ───────────────────────────────────────────────────

export function makeTable(overrides: Record<string, unknown> = {}) {
    const now = Date.now();
    return {
        id: `tbl-${now}`,
        name: 'users',
        x: 100,
        y: 200,
        color: '#ffffff',
        isView: false,
        createdAt: now,
        fields: [
            {
                id: `fld-${now}`,
                name: 'id',
                type: { id: 'integer', name: 'integer' },
                primaryKey: true,
                unique: true,
                nullable: false,
                createdAt: now,
            },
        ],
        indexes: [],
        ...overrides,
    };
}

export function makeRelationship(
    sourceTableId: string,
    targetTableId: string,
    sourceFieldId: string,
    targetFieldId: string,
    overrides: Record<string, unknown> = {}
) {
    const now = Date.now();
    return {
        id: `rel-${now}`,
        name: `fk_${sourceTableId}_${targetTableId}`,
        sourceTableId,
        targetTableId,
        sourceFieldId,
        targetFieldId,
        sourceCardinality: 'one',
        targetCardinality: 'many',
        createdAt: now,
        ...overrides,
    };
}

export function makeArea(overrides: Record<string, unknown> = {}) {
    return {
        id: `area-${Date.now()}`,
        name: 'Auth',
        x: 0,
        y: 0,
        width: 400,
        height: 300,
        color: '#e0f2fe',
        ...overrides,
    };
}

export function makeNote(overrides: Record<string, unknown> = {}) {
    return {
        id: `note-${Date.now()}`,
        content: 'This is a note',
        x: 50,
        y: 50,
        width: 200,
        height: 100,
        color: '#fef9c3',
        ...overrides,
    };
}

export function makeCustomType(overrides: Record<string, unknown> = {}) {
    return {
        id: `ct-${Date.now()}`,
        name: 'user_status',
        kind: 'enum',
        values: ['active', 'inactive', 'banned'],
        ...overrides,
    };
}
