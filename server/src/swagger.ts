// =============================================================================
// ChartDB OpenAPI 3.0 Specification
// =============================================================================

// ─── Reusable primitive schemas ───────────────────────────────────────────────

const errorSchema = {
    type: 'object',
    required: ['error'],
    properties: {
        error: { type: 'string', example: 'Error message' },
    },
};

const messageSchema = {
    type: 'object',
    required: ['message'],
    properties: {
        message: {
            type: 'string',
            example: 'Operation completed successfully',
        },
    },
};

// ─── User ─────────────────────────────────────────────────────────────────────

const userSchema = {
    type: 'object',
    required: ['id', 'username', 'email', 'created_at', 'updated_at'],
    properties: {
        id: { type: 'string', example: '6749a1b2c3d4e5f6a7b8c9d0' },
        username: { type: 'string', example: 'johndoe' },
        email: { type: 'string', format: 'email', example: 'john@example.com' },
        deleted_at: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: null,
        },
        created_at: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T10:30:00.000Z',
        },
        updated_at: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T10:30:00.000Z',
        },
    },
};

// ─── DBField ──────────────────────────────────────────────────────────────────

const dbFieldSchema = {
    type: 'object',
    required: [
        'id',
        'name',
        'type',
        'primaryKey',
        'unique',
        'nullable',
        'createdAt',
    ],
    properties: {
        id: { type: 'string', example: 'field_abc123' },
        name: { type: 'string', example: 'user_id' },
        type: {
            type: 'object',
            description:
                'Data type descriptor (dialect-specific). E.g. { id: "integer" } or { id: "varchar", additionalParams: ["255"] }',
            example: { id: 'integer' },
        },
        primaryKey: { type: 'boolean', default: false, example: true },
        unique: { type: 'boolean', default: false, example: false },
        nullable: { type: 'boolean', default: true, example: false },
        increment: {
            type: 'boolean',
            nullable: true,
            default: null,
            example: true,
        },
        isArray: {
            type: 'boolean',
            nullable: true,
            default: null,
            example: false,
        },
        createdAt: { type: 'number', example: 1700000000000 },
        characterMaximumLength: {
            type: 'string',
            nullable: true,
            example: '255',
        },
        precision: { type: 'number', nullable: true, example: 10 },
        scale: { type: 'number', nullable: true, example: 2 },
        default: { type: 'string', nullable: true, example: 'now()' },
        collation: {
            type: 'string',
            nullable: true,
            example: 'utf8_general_ci',
        },
        comments: {
            type: 'string',
            nullable: true,
            example: 'Primary key for users',
        },
        check: { type: 'string', nullable: true, example: 'user_id > 0' },
    },
};

// ─── DBIndex ──────────────────────────────────────────────────────────────────

const dbIndexSchema = {
    type: 'object',
    required: ['id', 'name', 'unique', 'fieldIds', 'createdAt'],
    properties: {
        id: { type: 'string', example: 'idx_abc123' },
        name: { type: 'string', example: 'idx_users_email' },
        unique: { type: 'boolean', default: false, example: true },
        fieldIds: {
            type: 'array',
            items: { type: 'string' },
            example: ['field_abc123'],
        },
        createdAt: { type: 'number', example: 1700000000000 },
        type: {
            type: 'string',
            nullable: true,
            enum: [
                'btree',
                'hash',
                'gist',
                'gin',
                'spgist',
                'brin',
                'nonclustered',
                'clustered',
                'xml',
                'fulltext',
                'spatial',
                'index',
            ],
            example: 'btree',
        },
        isPrimaryKey: { type: 'boolean', nullable: true, example: false },
        comments: {
            type: 'string',
            nullable: true,
            example: 'Speeds up email lookups',
        },
    },
};

// ─── DBCheckConstraint ────────────────────────────────────────────────────────

const dbCheckConstraintSchema = {
    type: 'object',
    required: ['id', 'name', 'definition'],
    properties: {
        id: { type: 'string', example: 'chk_abc123' },
        name: { type: 'string', example: 'chk_age_positive' },
        definition: { type: 'string', example: 'age >= 0' },
    },
};

// ─── DBTable ──────────────────────────────────────────────────────────────────

const dbTableSchema = {
    type: 'object',
    required: [
        'id',
        'name',
        'x',
        'y',
        'color',
        'isView',
        'createdAt',
        'fields',
        'indexes',
    ],
    properties: {
        id: { type: 'string', example: 'tbl_abc123' },
        name: { type: 'string', example: 'users' },
        schema: { type: 'string', nullable: true, example: 'public' },
        x: { type: 'number', description: 'Canvas X position', example: 120 },
        y: { type: 'number', description: 'Canvas Y position', example: 80 },
        fields: {
            type: 'array',
            items: { $ref: '#/components/schemas/DBField' },
        },
        indexes: {
            type: 'array',
            items: { $ref: '#/components/schemas/DBIndex' },
        },
        checkConstraints: {
            type: 'array',
            nullable: true,
            items: { $ref: '#/components/schemas/DBCheckConstraint' },
        },
        color: { type: 'string', example: '#3b82f6' },
        isView: { type: 'boolean', default: false, example: false },
        isMaterializedView: { type: 'boolean', nullable: true, example: false },
        createdAt: { type: 'number', example: 1700000000000 },
        width: { type: 'number', nullable: true, example: 220 },
        comments: {
            type: 'string',
            nullable: true,
            example: 'Stores registered users',
        },
        order: { type: 'number', nullable: true, example: 0 },
        expanded: { type: 'boolean', nullable: true, example: true },
        parentAreaId: {
            type: 'string',
            nullable: true,
            example: 'area_abc123',
        },
    },
};

// ─── DBRelationship ───────────────────────────────────────────────────────────

const dbRelationshipSchema = {
    type: 'object',
    required: [
        'id',
        'name',
        'sourceTableId',
        'targetTableId',
        'sourceFieldId',
        'targetFieldId',
        'sourceCardinality',
        'targetCardinality',
        'createdAt',
    ],
    properties: {
        id: { type: 'string', example: 'rel_abc123' },
        name: { type: 'string', example: 'users_orders_fk' },
        sourceSchema: { type: 'string', nullable: true, example: 'public' },
        sourceTableId: { type: 'string', example: 'tbl_orders' },
        targetSchema: { type: 'string', nullable: true, example: 'public' },
        targetTableId: { type: 'string', example: 'tbl_users' },
        sourceFieldId: { type: 'string', example: 'field_order_user_id' },
        targetFieldId: { type: 'string', example: 'field_user_id' },
        sourceCardinality: {
            type: 'string',
            enum: ['one', 'many'],
            example: 'many',
        },
        targetCardinality: {
            type: 'string',
            enum: ['one', 'many'],
            example: 'one',
        },
        createdAt: { type: 'number', example: 1700000000000 },
    },
};

// ─── Area ─────────────────────────────────────────────────────────────────────

const areaSchema = {
    type: 'object',
    required: ['id', 'name', 'x', 'y', 'width', 'height', 'color'],
    properties: {
        id: { type: 'string', example: 'area_abc123' },
        name: { type: 'string', example: 'Auth Module' },
        x: { type: 'number', description: 'Canvas X position', example: 50 },
        y: { type: 'number', description: 'Canvas Y position', example: 50 },
        width: { type: 'number', example: 400 },
        height: { type: 'number', example: 300 },
        color: { type: 'string', example: '#fef08a' },
        order: { type: 'number', example: 0 },
    },
};

// ─── Note ─────────────────────────────────────────────────────────────────────

const noteSchema = {
    type: 'object',
    required: ['id', 'content', 'x', 'y', 'width', 'height', 'color'],
    properties: {
        id: { type: 'string', example: 'note_abc123' },
        content: {
            type: 'string',
            example: 'TODO: add soft-delete to this table',
        },
        x: { type: 'number', description: 'Canvas X position', example: 300 },
        y: { type: 'number', description: 'Canvas Y position', example: 200 },
        width: { type: 'number', example: 200 },
        height: { type: 'number', example: 100 },
        color: { type: 'string', example: '#fde68a' },
        order: { type: 'number', example: 0 },
    },
};

// ─── DBCustomType ─────────────────────────────────────────────────────────────

const dbCustomTypeFieldSchema = {
    type: 'object',
    required: ['field', 'type'],
    properties: {
        field: { type: 'string', example: 'street' },
        type: { type: 'string', example: 'varchar' },
    },
};

const dbCustomTypeSchema = {
    type: 'object',
    required: ['id', 'name', 'kind'],
    properties: {
        id: { type: 'string', example: 'ct_abc123' },
        schema: { type: 'string', nullable: true, example: 'public' },
        name: { type: 'string', example: 'user_role' },
        kind: {
            type: 'string',
            enum: ['enum', 'composite'],
            example: 'enum',
        },
        values: {
            type: 'array',
            nullable: true,
            description: 'Values list (for enum types)',
            items: { type: 'string' },
            example: ['admin', 'editor', 'viewer'],
        },
        fields: {
            type: 'array',
            nullable: true,
            description: 'Sub-fields (for composite types)',
            items: { $ref: '#/components/schemas/DBCustomTypeField' },
        },
        order: { type: 'number', nullable: true, example: 0 },
    },
};

// ─── Diagram ──────────────────────────────────────────────────────────────────

const diagramSummarySchema = {
    type: 'object',
    required: [
        '_id',
        'userId',
        'name',
        'databaseType',
        'createdAt',
        'updatedAt',
    ],
    properties: {
        _id: { type: 'string', example: '6749a1b2c3d4e5f6a7b8c9d0' },
        userId: { type: 'string', example: '6749a1b2c3d4e5f6a7b8c9d1' },
        name: { type: 'string', example: 'E-commerce Schema' },
        databaseType: {
            type: 'string',
            example: 'postgresql',
            enum: [
                'postgresql',
                'mysql',
                'sqlite',
                'mssql',
                'mariadb',
                'oracle',
                'generic',
            ],
        },
        databaseEdition: { type: 'string', nullable: true, example: null },
        createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T10:30:00.000Z',
        },
        updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T12:00:00.000Z',
        },
    },
};

const diagramSchema = {
    allOf: [
        { $ref: '#/components/schemas/DiagramSummary' },
        {
            type: 'object',
            properties: {
                tables: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/DBTable' },
                },
                relationships: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/DBRelationship' },
                },
                dependencies: {
                    type: 'array',
                    items: { type: 'object' },
                },
                areas: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Area' },
                },
                notes: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Note' },
                },
                customTypes: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/DBCustomType' },
                },
            },
        },
    ],
};

// ─── Request bodies ───────────────────────────────────────────────────────────

const createDiagramRequest = {
    type: 'object',
    required: ['name', 'databaseType'],
    properties: {
        name: {
            type: 'string',
            minLength: 1,
            maxLength: 255,
            example: 'E-commerce Schema',
        },
        databaseType: {
            type: 'string',
            enum: [
                'postgresql',
                'mysql',
                'sqlite',
                'mssql',
                'mariadb',
                'oracle',
                'generic',
            ],
            example: 'postgresql',
        },
        databaseEdition: { type: 'string', nullable: true, example: null },
        tables: {
            type: 'array',
            items: { $ref: '#/components/schemas/DBTable' },
            default: [],
        },
        relationships: {
            type: 'array',
            items: { $ref: '#/components/schemas/DBRelationship' },
            default: [],
        },
        areas: {
            type: 'array',
            items: { $ref: '#/components/schemas/Area' },
            default: [],
        },
        notes: {
            type: 'array',
            items: { $ref: '#/components/schemas/Note' },
            default: [],
        },
        customTypes: {
            type: 'array',
            items: { $ref: '#/components/schemas/DBCustomType' },
            default: [],
        },
    },
};

const updateDiagramRequest = {
    type: 'object',
    description:
        'All fields are optional. Only provided fields will be updated.',
    properties: {
        name: {
            type: 'string',
            minLength: 1,
            maxLength: 255,
            example: 'Updated Schema Name',
        },
        databaseType: { type: 'string', example: 'mysql' },
        databaseEdition: { type: 'string', nullable: true },
        tables: {
            type: 'array',
            items: { $ref: '#/components/schemas/DBTable' },
        },
        relationships: {
            type: 'array',
            items: { $ref: '#/components/schemas/DBRelationship' },
        },
        areas: { type: 'array', items: { $ref: '#/components/schemas/Area' } },
        notes: { type: 'array', items: { $ref: '#/components/schemas/Note' } },
        customTypes: {
            type: 'array',
            items: { $ref: '#/components/schemas/DBCustomType' },
        },
    },
};

// ─── Common path parameter ────────────────────────────────────────────────────

const diagramIdParam = {
    in: 'path',
    name: 'diagramId',
    required: true,
    schema: { type: 'string' },
    description: 'MongoDB ObjectId of the diagram',
    example: '6749a1b2c3d4e5f6a7b8c9d0',
};

// =============================================================================
// OpenAPI 3.0 Specification export
// =============================================================================

export const swaggerSpec = {
    openapi: '3.0.0',
    info: {
        title: 'ChartDB API',
        version: '2.0.0',
        description: `
## ChartDB REST API

Backend for [ChartDB](https://chartdb.io) — a browser-based database schema diagramming editor.

### Authentication

All protected endpoints require a valid **access_token** HttpOnly cookie obtained via \`POST /api/auth/login\` or \`POST /api/auth/register\`.
Tokens expire after **15 minutes**. Use \`POST /api/auth/refresh\` (with the refresh_token cookie) to issue a new one.

### Data Model

A **Diagram** is the top-level resource. It belongs to a user and contains:
- **Tables** — database tables/views with fields, indexes, and check constraints
- **Relationships** — foreign-key edges between two table fields (with cardinality)
- **Areas** — visual grouping boxes on the canvas
- **Notes** — text annotations on the canvas
- **Custom Types** — user-defined types (enum or composite, e.g. PostgreSQL)

All nested resources are embedded inside the Diagram document in MongoDB, so sub-resource endpoints operate on array elements via \`$push\` / \`$pull\` / \`$set\`.

### Authorization

Every diagram endpoint enforces ownership — a user can only read or modify their own diagrams.
        `.trim(),
        contact: {
            name: 'ChartDB',
            url: 'https://github.com/chartdb/chartdb',
        },
        license: {
            name: 'AGPL-3.0',
            url: 'https://github.com/chartdb/chartdb/blob/main/LICENSE',
        },
    },
    servers: [
        {
            url: 'http://localhost:3001',
            description: 'Local development server',
        },
    ],
    tags: [
        {
            name: 'Auth',
            description:
                'Registration, login, logout and token refresh. Cookies are used for session management (HttpOnly, SameSite=Strict).',
        },
        {
            name: 'Health',
            description:
                'Server liveness probe — useful for container orchestration.',
        },
        {
            name: 'Diagrams',
            description:
                'Create, read, update, delete and clone diagrams. The list endpoint returns metadata only (no tables/relationships) for performance.',
        },
        {
            name: 'Tables',
            description:
                'Manage tables within a diagram. Each table holds an array of **fields** and **indexes** embedded in the same document.',
        },
        {
            name: 'Relationships',
            description:
                'Manage foreign-key relationships between table fields. Cardinality is expressed per side (`one` | `many`).',
        },
        {
            name: 'Areas',
            description:
                'Canvas grouping areas — rectangular regions that visually cluster related tables.',
        },
        {
            name: 'Notes',
            description:
                'Free-text annotations rendered on the canvas as sticky notes.',
        },
        {
            name: 'CustomTypes',
            description:
                'User-defined types: `enum` (list of string values) or `composite` (named fields with types). Used mainly for PostgreSQL domains/enums.',
        },
    ],
    components: {
        securitySchemes: {
            cookieAuth: {
                type: 'apiKey',
                in: 'cookie',
                name: 'access_token',
                description:
                    'JWT access token (15 min TTL) stored as an HttpOnly, SameSite=Strict cookie.',
            },
        },
        schemas: {
            // ── Primitives ────────────────────────────────────────────────────
            Error: errorSchema,
            Message: messageSchema,
            // ── Auth ──────────────────────────────────────────────────────────
            User: userSchema,
            RegisterRequest: {
                type: 'object',
                required: ['username', 'email', 'password'],
                properties: {
                    username: {
                        type: 'string',
                        minLength: 3,
                        maxLength: 30,
                        pattern: '^[a-zA-Z0-9_]+$',
                        example: 'johndoe',
                        description: 'Letters, numbers and underscores only.',
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'john@example.com',
                    },
                    password: {
                        type: 'string',
                        format: 'password',
                        minLength: 8,
                        example: 'supersecret123',
                    },
                },
            },
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'john@example.com',
                    },
                    password: {
                        type: 'string',
                        format: 'password',
                        example: 'supersecret123',
                    },
                },
            },
            AuthResponse: {
                type: 'object',
                required: ['user'],
                properties: {
                    user: { $ref: '#/components/schemas/User' },
                },
            },
            // ── Domain ────────────────────────────────────────────────────────
            DBField: dbFieldSchema,
            DBIndex: dbIndexSchema,
            DBCheckConstraint: dbCheckConstraintSchema,
            DBTable: dbTableSchema,
            DBRelationship: dbRelationshipSchema,
            Area: areaSchema,
            Note: noteSchema,
            DBCustomTypeField: dbCustomTypeFieldSchema,
            DBCustomType: dbCustomTypeSchema,
            DiagramSummary: diagramSummarySchema,
            Diagram: diagramSchema,
            // ── Requests ──────────────────────────────────────────────────────
            CreateDiagramRequest: createDiagramRequest,
            UpdateDiagramRequest: updateDiagramRequest,
        },
        responses: {
            Unauthorized: {
                description: 'Missing or invalid access_token cookie.',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' },
                        example: { error: 'Unauthorized' },
                    },
                },
            },
            NotFound: {
                description:
                    'The requested resource does not exist or does not belong to the current user.',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' },
                        example: { error: 'Diagram not found' },
                    },
                },
            },
            ValidationError: {
                description: 'Request body failed Zod validation.',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' },
                        example: { error: 'Name is required' },
                    },
                },
            },
            Conflict: {
                description: 'Unique constraint violated.',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' },
                        example: { error: 'Email already in use' },
                    },
                },
            },
            InternalError: {
                description: 'Unexpected server error.',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' },
                        example: { error: 'Internal server error' },
                    },
                },
            },
        },
    },

    // =========================================================================
    // Paths
    // =========================================================================
    paths: {
        // ── Health ────────────────────────────────────────────────────────────
        '/api/health': {
            get: {
                tags: ['Health'],
                summary: 'Liveness probe',
                description:
                    'Returns HTTP 200 when the server is running and connected to MongoDB. Safe to use as a container health check.',
                operationId: 'getHealth',
                responses: {
                    '200': {
                        description: 'Server is healthy',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: {
                                            type: 'string',
                                            example: 'ok',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
        },

        // ── Auth ──────────────────────────────────────────────────────────────
        '/api/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Register a new account',
                description:
                    'Creates a new user account, hashes the password with bcrypt (cost 12), and issues `access_token` + `refresh_token` HttpOnly cookies.',
                operationId: 'register',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/RegisterRequest',
                            },
                            example: {
                                username: 'johndoe',
                                email: 'john@example.com',
                                password: 'supersecret123',
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description:
                            'Account created — session cookies are set.',
                        headers: {
                            'Set-Cookie': {
                                description:
                                    'Sets `access_token` (15 min) and `refresh_token` (7 days) HttpOnly cookies.',
                                schema: { type: 'string' },
                            },
                        },
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/AuthResponse',
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/ValidationError' },
                    '409': { $ref: '#/components/responses/Conflict' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
        },

        '/api/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login',
                description:
                    'Validates credentials and issues `access_token` + `refresh_token` HttpOnly cookies on success.',
                operationId: 'login',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/LoginRequest',
                            },
                            example: {
                                email: 'john@example.com',
                                password: 'supersecret123',
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description:
                            'Login successful — session cookies are set.',
                        headers: {
                            'Set-Cookie': {
                                description:
                                    'Sets `access_token` (15 min) and `refresh_token` (7 days) HttpOnly cookies.',
                                schema: { type: 'string' },
                            },
                        },
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/AuthResponse',
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/ValidationError' },
                    '401': {
                        description: 'Invalid email or password.',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Error' },
                                example: { error: 'Invalid credentials' },
                            },
                        },
                    },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
        },

        '/api/auth/logout': {
            post: {
                tags: ['Auth'],
                summary: 'Logout',
                description:
                    'Clears the `access_token` and `refresh_token` cookies. No authentication required — safe to call even with an expired token.',
                operationId: 'logout',
                responses: {
                    '200': {
                        description: 'Logged out. Cookies are cleared.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Message',
                                },
                                example: { message: 'Logged out successfully' },
                            },
                        },
                    },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
        },

        '/api/auth/me': {
            get: {
                tags: ['Auth'],
                summary: 'Get current user',
                description:
                    'Returns the profile of the currently authenticated user. Useful for session restoration on page load.',
                operationId: 'getMe',
                security: [{ cookieAuth: [] }],
                responses: {
                    '200': {
                        description: 'Authenticated user profile.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/AuthResponse',
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
        },

        '/api/auth/refresh': {
            post: {
                tags: ['Auth'],
                summary: 'Refresh access token',
                description:
                    'Issues a new `access_token` using the `refresh_token` cookie (7-day TTL). Call this automatically when any request returns 401.',
                operationId: 'refreshToken',
                parameters: [
                    {
                        in: 'cookie',
                        name: 'refresh_token',
                        required: true,
                        schema: { type: 'string' },
                        description:
                            'Long-lived JWT refresh token (7 days, HttpOnly cookie).',
                    },
                ],
                responses: {
                    '200': {
                        description: 'New access_token issued.',
                        headers: {
                            'Set-Cookie': {
                                description:
                                    'New `access_token` cookie (15 min).',
                                schema: { type: 'string' },
                            },
                        },
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Message',
                                },
                                example: { message: 'Token refreshed' },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
        },

        // ── Diagrams ──────────────────────────────────────────────────────────
        '/api/diagrams': {
            get: {
                tags: ['Diagrams'],
                summary: 'List diagrams',
                description:
                    'Returns all diagrams owned by the current user, sorted by most recently updated. **Tables, relationships and other nested data are excluded** — use `GET /api/diagrams/:diagramId` to load the full diagram.',
                operationId: 'listDiagrams',
                security: [{ cookieAuth: [] }],
                responses: {
                    '200': {
                        description: 'Array of diagram summaries.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['diagrams'],
                                    properties: {
                                        diagrams: {
                                            type: 'array',
                                            items: {
                                                $ref: '#/components/schemas/DiagramSummary',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
            post: {
                tags: ['Diagrams'],
                summary: 'Create a diagram',
                description:
                    'Creates a new empty (or pre-populated) diagram and associates it with the current user.',
                operationId: 'createDiagram',
                security: [{ cookieAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/CreateDiagramRequest',
                            },
                            example: {
                                name: 'E-commerce Schema',
                                databaseType: 'postgresql',
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Diagram created.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['diagram'],
                                    properties: {
                                        diagram: {
                                            $ref: '#/components/schemas/Diagram',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/ValidationError' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
        },

        '/api/diagrams/{diagramId}': {
            get: {
                tags: ['Diagrams'],
                summary: 'Get a diagram',
                description:
                    'Returns the full diagram document including all tables, relationships, areas, notes and custom types.',
                operationId: 'getDiagram',
                security: [{ cookieAuth: [] }],
                parameters: [diagramIdParam],
                responses: {
                    '200': {
                        description: 'Full diagram.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['diagram'],
                                    properties: {
                                        diagram: {
                                            $ref: '#/components/schemas/Diagram',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
            put: {
                tags: ['Diagrams'],
                summary: 'Update a diagram',
                description:
                    'Partial update — only the fields present in the request body are modified. To replace the full table/relationship arrays, pass them in their entirety.',
                operationId: 'updateDiagram',
                security: [{ cookieAuth: [] }],
                parameters: [diagramIdParam],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/UpdateDiagramRequest',
                            },
                            example: { name: 'Renamed Schema' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Updated diagram.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['diagram'],
                                    properties: {
                                        diagram: {
                                            $ref: '#/components/schemas/Diagram',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/ValidationError' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
            delete: {
                tags: ['Diagrams'],
                summary: 'Delete a diagram',
                description:
                    'Permanently deletes the diagram and all its embedded data (tables, relationships, areas, notes, custom types). **This action is irreversible.**',
                operationId: 'deleteDiagram',
                security: [{ cookieAuth: [] }],
                parameters: [diagramIdParam],
                responses: {
                    '200': {
                        description: 'Diagram deleted.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Message',
                                },
                                example: {
                                    message: 'Diagram deleted successfully',
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
        },

        '/api/diagrams/{diagramId}/clone': {
            post: {
                tags: ['Diagrams'],
                summary: 'Clone a diagram',
                description:
                    'Creates a deep copy of an existing diagram (including all tables, relationships, areas, notes and custom types) and associates it with the current user. Optionally supply a new name.',
                operationId: 'cloneDiagram',
                security: [{ cookieAuth: [] }],
                parameters: [diagramIdParam],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: {
                                        type: 'string',
                                        example: 'E-commerce Schema (copy)',
                                        description:
                                            'Name for the clone. Defaults to "<original name> (copy)".',
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Cloned diagram.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['diagram'],
                                    properties: {
                                        diagram: {
                                            $ref: '#/components/schemas/Diagram',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
        },

        // ── Tables ────────────────────────────────────────────────────────────
        '/api/diagrams/{diagramId}/tables': {
            get: {
                tags: ['Tables'],
                summary: 'List tables',
                description:
                    'Returns all tables in the diagram, including their fields, indexes and check constraints.',
                operationId: 'listTables',
                security: [{ cookieAuth: [] }],
                parameters: [diagramIdParam],
                responses: {
                    '200': {
                        description: 'Array of tables.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['tables'],
                                    properties: {
                                        tables: {
                                            type: 'array',
                                            items: {
                                                $ref: '#/components/schemas/DBTable',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
            post: {
                tags: ['Tables'],
                summary: 'Add a table',
                description:
                    'Appends a new table (with its fields, indexes and canvas position) to the diagram.',
                operationId: 'addTable',
                security: [{ cookieAuth: [] }],
                parameters: [diagramIdParam],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/DBTable' },
                            example: {
                                id: 'tbl_abc123',
                                name: 'users',
                                schema: 'public',
                                x: 120,
                                y: 80,
                                color: '#3b82f6',
                                isView: false,
                                createdAt: 1700000000000,
                                fields: [
                                    {
                                        id: 'field_abc123',
                                        name: 'id',
                                        type: { id: 'bigint' },
                                        primaryKey: true,
                                        unique: true,
                                        nullable: false,
                                        increment: true,
                                        createdAt: 1700000000000,
                                    },
                                ],
                                indexes: [],
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Table added.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['table'],
                                    properties: {
                                        table: {
                                            $ref: '#/components/schemas/DBTable',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/ValidationError' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
        },

        '/api/diagrams/{diagramId}/tables/{tableId}': {
            get: {
                tags: ['Tables'],
                summary: 'Get a table',
                description:
                    'Returns a single table by its client-side `id` field.',
                operationId: 'getTable',
                security: [{ cookieAuth: [] }],
                parameters: [
                    diagramIdParam,
                    {
                        in: 'path',
                        name: 'tableId',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Client-side table id (not MongoDB _id)',
                        example: 'tbl_abc123',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Table data.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['table'],
                                    properties: {
                                        table: {
                                            $ref: '#/components/schemas/DBTable',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
            put: {
                tags: ['Tables'],
                summary: 'Update a table',
                description:
                    'Partially updates a table. Any field of `DBTable` (except `id` and `createdAt`) can be updated, including `fields`, `indexes` and canvas position.',
                operationId: 'updateTable',
                security: [{ cookieAuth: [] }],
                parameters: [
                    diagramIdParam,
                    {
                        in: 'path',
                        name: 'tableId',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Client-side table id',
                        example: 'tbl_abc123',
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                description:
                                    'Any subset of DBTable fields (except id and createdAt).',
                                properties: {
                                    name: { type: 'string' },
                                    x: { type: 'number' },
                                    y: { type: 'number' },
                                    fields: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/DBField',
                                        },
                                    },
                                    indexes: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/DBIndex',
                                        },
                                    },
                                    color: { type: 'string' },
                                    comments: {
                                        type: 'string',
                                        nullable: true,
                                    },
                                },
                            },
                            example: { x: 200, y: 150, color: '#ef4444' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Updated table.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['table'],
                                    properties: {
                                        table: {
                                            $ref: '#/components/schemas/DBTable',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/ValidationError' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
            delete: {
                tags: ['Tables'],
                summary: 'Delete a table',
                description:
                    'Removes a table from the diagram. Does **not** cascade-delete relationships — remove those separately if needed.',
                operationId: 'deleteTable',
                security: [{ cookieAuth: [] }],
                parameters: [
                    diagramIdParam,
                    {
                        in: 'path',
                        name: 'tableId',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Client-side table id',
                        example: 'tbl_abc123',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Table deleted.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Message',
                                },
                                example: {
                                    message: 'Table deleted successfully',
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
        },

        // ── Relationships ─────────────────────────────────────────────────────
        '/api/diagrams/{diagramId}/relationships': {
            get: {
                tags: ['Relationships'],
                summary: 'List relationships',
                description:
                    'Returns all foreign-key relationships defined in the diagram.',
                operationId: 'listRelationships',
                security: [{ cookieAuth: [] }],
                parameters: [diagramIdParam],
                responses: {
                    '200': {
                        description: 'Array of relationships.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['relationships'],
                                    properties: {
                                        relationships: {
                                            type: 'array',
                                            items: {
                                                $ref: '#/components/schemas/DBRelationship',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
            post: {
                tags: ['Relationships'],
                summary: 'Add a relationship',
                description:
                    'Creates a new foreign-key relationship between two table fields. `sourceCardinality` and `targetCardinality` together define the type (e.g. `many`→`one` = many-to-one).',
                operationId: 'addRelationship',
                security: [{ cookieAuth: [] }],
                parameters: [diagramIdParam],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/DBRelationship',
                            },
                            example: {
                                id: 'rel_abc123',
                                name: 'orders_users_fk',
                                sourceTableId: 'tbl_orders',
                                targetTableId: 'tbl_users',
                                sourceFieldId: 'field_order_user_id',
                                targetFieldId: 'field_user_id',
                                sourceCardinality: 'many',
                                targetCardinality: 'one',
                                createdAt: 1700000000000,
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Relationship added.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['relationship'],
                                    properties: {
                                        relationship: {
                                            $ref: '#/components/schemas/DBRelationship',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/ValidationError' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
        },

        '/api/diagrams/{diagramId}/relationships/{relationshipId}': {
            get: {
                tags: ['Relationships'],
                summary: 'Get a relationship',
                operationId: 'getRelationship',
                security: [{ cookieAuth: [] }],
                parameters: [
                    diagramIdParam,
                    {
                        in: 'path',
                        name: 'relationshipId',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Client-side relationship id',
                        example: 'rel_abc123',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Relationship data.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['relationship'],
                                    properties: {
                                        relationship: {
                                            $ref: '#/components/schemas/DBRelationship',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
            put: {
                tags: ['Relationships'],
                summary: 'Update a relationship',
                description:
                    'Partially updates a relationship. Useful for changing cardinality or renaming a foreign key.',
                operationId: 'updateRelationship',
                security: [{ cookieAuth: [] }],
                parameters: [
                    diagramIdParam,
                    {
                        in: 'path',
                        name: 'relationshipId',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Client-side relationship id',
                        example: 'rel_abc123',
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    sourceCardinality: {
                                        type: 'string',
                                        enum: ['one', 'many'],
                                    },
                                    targetCardinality: {
                                        type: 'string',
                                        enum: ['one', 'many'],
                                    },
                                },
                            },
                            example: {
                                sourceCardinality: 'one',
                                targetCardinality: 'one',
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Updated relationship.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['relationship'],
                                    properties: {
                                        relationship: {
                                            $ref: '#/components/schemas/DBRelationship',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/ValidationError' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
            delete: {
                tags: ['Relationships'],
                summary: 'Delete a relationship',
                operationId: 'deleteRelationship',
                security: [{ cookieAuth: [] }],
                parameters: [
                    diagramIdParam,
                    {
                        in: 'path',
                        name: 'relationshipId',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Client-side relationship id',
                        example: 'rel_abc123',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Relationship deleted.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Message',
                                },
                                example: {
                                    message:
                                        'Relationship deleted successfully',
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
        },

        // ── Areas ─────────────────────────────────────────────────────────────
        '/api/diagrams/{diagramId}/areas': {
            get: {
                tags: ['Areas'],
                summary: 'List areas',
                description:
                    'Returns all canvas grouping areas in the diagram.',
                operationId: 'listAreas',
                security: [{ cookieAuth: [] }],
                parameters: [diagramIdParam],
                responses: {
                    '200': {
                        description: 'Array of areas.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['areas'],
                                    properties: {
                                        areas: {
                                            type: 'array',
                                            items: {
                                                $ref: '#/components/schemas/Area',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
            post: {
                tags: ['Areas'],
                summary: 'Add an area',
                description: 'Creates a new grouping area on the canvas.',
                operationId: 'addArea',
                security: [{ cookieAuth: [] }],
                parameters: [diagramIdParam],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Area' },
                            example: {
                                id: 'area_abc123',
                                name: 'Auth Module',
                                x: 50,
                                y: 50,
                                width: 400,
                                height: 300,
                                color: '#fef08a',
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Area added.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['area'],
                                    properties: {
                                        area: {
                                            $ref: '#/components/schemas/Area',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/ValidationError' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
        },

        '/api/diagrams/{diagramId}/areas/{areaId}': {
            put: {
                tags: ['Areas'],
                summary: 'Update an area',
                description:
                    'Partially updates an area (name, position, size or color).',
                operationId: 'updateArea',
                security: [{ cookieAuth: [] }],
                parameters: [
                    diagramIdParam,
                    {
                        in: 'path',
                        name: 'areaId',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Client-side area id',
                        example: 'area_abc123',
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    x: { type: 'number' },
                                    y: { type: 'number' },
                                    width: { type: 'number' },
                                    height: { type: 'number' },
                                    color: { type: 'string' },
                                    order: { type: 'number' },
                                },
                            },
                            example: {
                                x: 100,
                                y: 100,
                                width: 500,
                                height: 350,
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Updated area.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['area'],
                                    properties: {
                                        area: {
                                            $ref: '#/components/schemas/Area',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/ValidationError' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
            delete: {
                tags: ['Areas'],
                summary: 'Delete an area',
                description:
                    'Removes a canvas area. Tables inside the area are **not** deleted — they simply lose their `parentAreaId`.',
                operationId: 'deleteArea',
                security: [{ cookieAuth: [] }],
                parameters: [
                    diagramIdParam,
                    {
                        in: 'path',
                        name: 'areaId',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Client-side area id',
                        example: 'area_abc123',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Area deleted.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Message',
                                },
                                example: {
                                    message: 'Area deleted successfully',
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
        },

        // ── Notes ─────────────────────────────────────────────────────────────
        '/api/diagrams/{diagramId}/notes': {
            get: {
                tags: ['Notes'],
                summary: 'List notes',
                description:
                    'Returns all sticky-note annotations in the diagram.',
                operationId: 'listNotes',
                security: [{ cookieAuth: [] }],
                parameters: [diagramIdParam],
                responses: {
                    '200': {
                        description: 'Array of notes.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['notes'],
                                    properties: {
                                        notes: {
                                            type: 'array',
                                            items: {
                                                $ref: '#/components/schemas/Note',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
            post: {
                tags: ['Notes'],
                summary: 'Add a note',
                description:
                    'Adds a new text annotation to the diagram canvas.',
                operationId: 'addNote',
                security: [{ cookieAuth: [] }],
                parameters: [diagramIdParam],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Note' },
                            example: {
                                id: 'note_abc123',
                                content: 'TODO: add soft-delete here',
                                x: 300,
                                y: 200,
                                width: 200,
                                height: 100,
                                color: '#fde68a',
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Note added.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['note'],
                                    properties: {
                                        note: {
                                            $ref: '#/components/schemas/Note',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/ValidationError' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
        },

        '/api/diagrams/{diagramId}/notes/{noteId}': {
            put: {
                tags: ['Notes'],
                summary: 'Update a note',
                description:
                    'Partially updates a note (content, position, size or color).',
                operationId: 'updateNote',
                security: [{ cookieAuth: [] }],
                parameters: [
                    diagramIdParam,
                    {
                        in: 'path',
                        name: 'noteId',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Client-side note id',
                        example: 'note_abc123',
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    content: { type: 'string' },
                                    x: { type: 'number' },
                                    y: { type: 'number' },
                                    width: { type: 'number' },
                                    height: { type: 'number' },
                                    color: { type: 'string' },
                                    order: { type: 'number' },
                                },
                            },
                            example: {
                                content: 'Updated note text',
                                color: '#bbf7d0',
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Updated note.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['note'],
                                    properties: {
                                        note: {
                                            $ref: '#/components/schemas/Note',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/ValidationError' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
            delete: {
                tags: ['Notes'],
                summary: 'Delete a note',
                operationId: 'deleteNote',
                security: [{ cookieAuth: [] }],
                parameters: [
                    diagramIdParam,
                    {
                        in: 'path',
                        name: 'noteId',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Client-side note id',
                        example: 'note_abc123',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Note deleted.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Message',
                                },
                                example: {
                                    message: 'Note deleted successfully',
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
        },

        // ── Custom Types ──────────────────────────────────────────────────────
        '/api/diagrams/{diagramId}/custom-types': {
            get: {
                tags: ['CustomTypes'],
                summary: 'List custom types',
                description:
                    'Returns all user-defined types (enums and composites) in the diagram.',
                operationId: 'listCustomTypes',
                security: [{ cookieAuth: [] }],
                parameters: [diagramIdParam],
                responses: {
                    '200': {
                        description: 'Array of custom types.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['customTypes'],
                                    properties: {
                                        customTypes: {
                                            type: 'array',
                                            items: {
                                                $ref: '#/components/schemas/DBCustomType',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
            post: {
                tags: ['CustomTypes'],
                summary: 'Add a custom type',
                description:
                    'Creates a new user-defined type. Use `kind: "enum"` with a `values` array, or `kind: "composite"` with a `fields` array.',
                operationId: 'addCustomType',
                security: [{ cookieAuth: [] }],
                parameters: [diagramIdParam],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/DBCustomType',
                            },
                            examples: {
                                enumType: {
                                    summary: 'Enum type',
                                    value: {
                                        id: 'ct_abc123',
                                        schema: 'public',
                                        name: 'user_role',
                                        kind: 'enum',
                                        values: ['admin', 'editor', 'viewer'],
                                    },
                                },
                                compositeType: {
                                    summary: 'Composite type',
                                    value: {
                                        id: 'ct_def456',
                                        schema: 'public',
                                        name: 'address',
                                        kind: 'composite',
                                        fields: [
                                            {
                                                field: 'street',
                                                type: 'varchar',
                                            },
                                            { field: 'city', type: 'varchar' },
                                            { field: 'zip', type: 'char(5)' },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Custom type added.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['customType'],
                                    properties: {
                                        customType: {
                                            $ref: '#/components/schemas/DBCustomType',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/ValidationError' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
        },

        '/api/diagrams/{diagramId}/custom-types/{typeId}': {
            put: {
                tags: ['CustomTypes'],
                summary: 'Update a custom type',
                description:
                    'Partially updates a custom type. You can switch `kind` or update `values`/`fields`.',
                operationId: 'updateCustomType',
                security: [{ cookieAuth: [] }],
                parameters: [
                    diagramIdParam,
                    {
                        in: 'path',
                        name: 'typeId',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Client-side custom type id',
                        example: 'ct_abc123',
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    kind: {
                                        type: 'string',
                                        enum: ['enum', 'composite'],
                                    },
                                    values: {
                                        type: 'array',
                                        items: { type: 'string' },
                                    },
                                    fields: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/DBCustomTypeField',
                                        },
                                    },
                                    order: { type: 'number' },
                                },
                            },
                            example: {
                                values: ['admin', 'editor', 'viewer', 'guest'],
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Updated custom type.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['customType'],
                                    properties: {
                                        customType: {
                                            $ref: '#/components/schemas/DBCustomType',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/ValidationError' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
            delete: {
                tags: ['CustomTypes'],
                summary: 'Delete a custom type',
                operationId: 'deleteCustomType',
                security: [{ cookieAuth: [] }],
                parameters: [
                    diagramIdParam,
                    {
                        in: 'path',
                        name: 'typeId',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Client-side custom type id',
                        example: 'ct_abc123',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Custom type deleted.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Message',
                                },
                                example: {
                                    message: 'Custom type deleted successfully',
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '500': { $ref: '#/components/responses/InternalError' },
                },
            },
        },
    },
};
