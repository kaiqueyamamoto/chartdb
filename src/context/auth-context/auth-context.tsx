import { createContext } from 'react';

export interface AuthUser {
    id: string;
    username: string;
    email: string;
}

export interface AuthContext {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (
        username: string,
        email: string,
        password: string
    ) => Promise<void>;
    logout: () => Promise<void>;
}

export const authContext = createContext<AuthContext>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    login: async () => {},
    register: async () => {},
    logout: async () => {},
});
