import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LocalConfigProvider } from '@/context/local-config-context/local-config-provider';
import { ThemeProvider } from '@/context/theme-context/theme-provider';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { ApiClientError } from '@/lib/api-client';
import ChartDBLogo from '@/assets/logo-light.png';
import ChartDBDarkLogo from '@/assets/logo-dark.png';
import { Helmet } from 'react-helmet-async';

const LoginPageComponent: React.FC = () => {
    const { effectiveTheme } = useTheme();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await login(email, password);
        } catch (err) {
            if (err instanceof ApiClientError) {
                setError(err.message);
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Sign In - ChartDB</title>
            </Helmet>
            <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
                <div className="w-full max-w-sm space-y-6">
                    {/* Logo */}
                    <div className="flex flex-col items-center gap-2">
                        <img
                            src={
                                effectiveTheme === 'dark'
                                    ? ChartDBDarkLogo
                                    : ChartDBLogo
                            }
                            alt="ChartDB"
                            className="h-10 w-auto"
                        />
                        <p className="text-sm text-muted-foreground">
                            Sign in to your account
                        </p>
                    </div>

                    {/* Card */}
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                    {error}
                                </p>
                            )}

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="email"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex h-9 w-full items-center justify-center rounded-md bg-pink-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-pink-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                        {"Don't have an account? "}
                        <Link
                            to="/register"
                            className="font-medium text-pink-600 hover:underline"
                        >
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
};

export const LoginPage: React.FC = () => (
    <LocalConfigProvider>
        <ThemeProvider>
            <LoginPageComponent />
        </ThemeProvider>
    </LocalConfigProvider>
);
