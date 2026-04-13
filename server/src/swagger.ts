// ---------------------------------------------------------------------------
// Reusable schema fragments
// ---------------------------------------------------------------------------

const errorSchema = {
    type: 'object',
    properties: {
        error: { type: 'string', example: 'Error message' },
    },
    required: ['error'],
};

const userSchema = {
    type: 'object',
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
    required: ['id', 'username', 'email', 'created_at', 'updated_at'],
};

// ---------------------------------------------------------------------------
// OpenAPI 3.0 specification
// ---------------------------------------------------------------------------

export const swaggerSpec = {
    openapi: '3.0.0',
    info: {
        title: 'ChartDB API',
        version: '1.0.0',
        description:
            'REST API for ChartDB — authentication and diagram management.',
    },
    servers: [
        {
            url: 'http://localhost:3001',
            description: 'Local development server',
        },
    ],
    tags: [
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Health', description: 'Server health check' },
    ],
    components: {
        securitySchemes: {
            cookieAuth: {
                type: 'apiKey',
                in: 'cookie',
                name: 'access_token',
                description: 'JWT access token stored in an HttpOnly cookie',
            },
        },
        schemas: {
            User: userSchema,
            Error: errorSchema,
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
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'john@example.com',
                    },
                    password: {
                        type: 'string',
                        minLength: 8,
                        format: 'password',
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
        },
        responses: {
            Unauthorized: {
                description: 'Missing or invalid access token',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' },
                        example: { error: 'Unauthorized' },
                    },
                },
            },
            ValidationError: {
                description: 'Request body failed validation',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' },
                        example: {
                            error: 'Username must be at least 3 characters',
                        },
                    },
                },
            },
            InternalError: {
                description: 'Unexpected server error',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' },
                        example: { error: 'Internal server error' },
                    },
                },
            },
        },
    },
    paths: {
        '/api/health': {
            get: {
                tags: ['Health'],
                summary: 'Health check',
                description: 'Returns 200 when the server is up and running.',
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
                },
            },
        },

        '/api/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Register a new user',
                description:
                    'Creates a new account and returns an authenticated session via HttpOnly cookies.',
                operationId: 'register',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/RegisterRequest',
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'User created successfully',
                        headers: {
                            'Set-Cookie': {
                                description:
                                    'Sets access_token and refresh_token HttpOnly cookies',
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
                    '409': {
                        description: 'Email or username already in use',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Error' },
                                examples: {
                                    emailTaken: {
                                        summary: 'Email already in use',
                                        value: {
                                            error: 'Email already in use',
                                        },
                                    },
                                    usernameTaken: {
                                        summary: 'Username already taken',
                                        value: {
                                            error: 'Username already taken',
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

        '/api/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login',
                description:
                    'Authenticates the user and sets access_token and refresh_token cookies.',
                operationId: 'login',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/LoginRequest',
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Login successful',
                        headers: {
                            'Set-Cookie': {
                                description:
                                    'Sets access_token and refresh_token HttpOnly cookies',
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
                        description: 'Invalid credentials',
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
                    'Clears the access_token and refresh_token cookies.',
                operationId: 'logout',
                responses: {
                    '200': {
                        description: 'Logged out successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: {
                                            type: 'string',
                                            example: 'Logged out successfully',
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

        '/api/auth/me': {
            get: {
                tags: ['Auth'],
                summary: 'Get current user',
                description:
                    'Returns the profile of the currently authenticated user.',
                operationId: 'getMe',
                security: [{ cookieAuth: [] }],
                responses: {
                    '200': {
                        description: 'Authenticated user profile',
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
                    'Issues a new access_token using the refresh_token cookie. Call this when the access token expires (15 min).',
                operationId: 'refreshToken',
                parameters: [
                    {
                        in: 'cookie',
                        name: 'refresh_token',
                        required: true,
                        schema: { type: 'string' },
                        description: 'JWT refresh token (HttpOnly cookie)',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Token refreshed successfully',
                        headers: {
                            'Set-Cookie': {
                                description: 'New access_token cookie',
                                schema: { type: 'string' },
                            },
                        },
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: {
                                            type: 'string',
                                            example: 'Token refreshed',
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
        },
    },
};
