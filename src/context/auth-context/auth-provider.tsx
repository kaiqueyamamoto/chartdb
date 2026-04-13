import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthUser } from './auth-context';
import { authContext } from './auth-context';
import { apiGet, apiPost, SESSION_EXPIRED_EVENT } from '@/lib/api-client';

interface MeResponse {
    user: AuthUser;
}

interface AuthResponse {
    user: AuthUser;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const clearSession = useCallback(() => {
        setUser(null);
        setIsLoading(false);
    }, []);

    // Check existing session on mount
    useEffect(() => {
        apiGet<MeResponse>('/api/auth/me')
            .then((data) => {
                setUser(data.user);
            })
            .catch(() => {
                setUser(null);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    // Listen for session expiry events dispatched by api-client
    useEffect(() => {
        const handler = () => {
            clearSession();
            navigate('/login', { replace: true });
        };
        window.addEventListener(SESSION_EXPIRED_EVENT, handler);
        return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler);
    }, [clearSession, navigate]);

    const login = useCallback(
        async (email: string, password: string): Promise<void> => {
            const data = await apiPost<AuthResponse>('/api/auth/login', {
                email,
                password,
            });
            setUser(data.user);
            navigate('/', { replace: true });
        },
        [navigate]
    );

    const register = useCallback(
        async (
            username: string,
            email: string,
            password: string
        ): Promise<void> => {
            const data = await apiPost<AuthResponse>('/api/auth/register', {
                username,
                email,
                password,
            });
            setUser(data.user);
            navigate('/', { replace: true });
        },
        [navigate]
    );

    const logout = useCallback(async (): Promise<void> => {
        await apiPost('/api/auth/logout');
        setUser(null);
        navigate('/login', { replace: true });
    }, [navigate]);

    return (
        <authContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: user !== null,
                login,
                register,
                logout,
            }}
        >
            {children}
        </authContext.Provider>
    );
};
