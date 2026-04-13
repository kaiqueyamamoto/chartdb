export interface ApiError {
    error: string;
}

const SESSION_EXPIRED_EVENT = 'auth:session-expired';

async function apiFetch<T>(
    path: string,
    options: RequestInit = {},
    isRetry = false
): Promise<T> {
    const headers: HeadersInit = {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers ?? {}),
    };

    const res = await fetch(path, {
        ...options,
        headers,
        credentials: 'include',
    });

    if (res.status === 401 && !isRetry) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
            return apiFetch<T>(path, options, true);
        }
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
        throw new ApiClientError('Session expired', 401);
    }

    if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new ApiClientError(
            (body as ApiError).error ?? res.statusText,
            res.status
        );
    }

    return res.json() as Promise<T>;
}

async function tryRefreshToken(): Promise<boolean> {
    try {
        const res = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
        });
        return res.ok;
    } catch {
        return false;
    }
}

export class ApiClientError extends Error {
    constructor(
        message: string,
        public readonly status: number
    ) {
        super(message);
        this.name = 'ApiClientError';
    }
}

export function apiGet<T>(path: string): Promise<T> {
    return apiFetch<T>(path, { method: 'GET' });
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
    return apiFetch<T>(path, {
        method: 'POST',
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
}

export { SESSION_EXPIRED_EVENT };
