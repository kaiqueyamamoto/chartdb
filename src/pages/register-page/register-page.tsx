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

interface FieldError {
    username?: string;
    email?: string;
    password?: string;
}

function validate(
    username: string,
    email: string,
    password: string
): FieldError {
    const errors: FieldError = {};

    if (username.length < 3 || username.length > 30) {
        errors.username = 'Username must be between 3 and 30 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.username =
            'Username can only contain letters, numbers and underscores';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Please enter a valid email address';
    }

    if (password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
    }

    return errors;
}

const RegisterPageComponent: React.FC = () => {
    const { effectiveTheme } = useTheme();
    const { register } = useAuth();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState<FieldError>({});
    const [serverError, setServerError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        const errors = validate(username, email, password);
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setIsSubmitting(true);
        try {
            await register(username, email, password);
        } catch (err) {
            if (err instanceof ApiClientError) {
                setServerError(err.message);
            } else {
                setServerError('Something went wrong. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Create Account - ChartDB</title>
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
                            Create your account
                        </p>
                    </div>

                    {/* Card */}
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {serverError && (
                                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                    {serverError}
                                </p>
                            )}

                            {/* Username */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="username"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="johndoe"
                                />
                                {fieldErrors.username && (
                                    <p className="text-xs text-destructive">
                                        {fieldErrors.username}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
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
                                {fieldErrors.email && (
                                    <p className="text-xs text-destructive">
                                        {fieldErrors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
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
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Min. 8 characters"
                                />
                                {fieldErrors.password && (
                                    <p className="text-xs text-destructive">
                                        {fieldErrors.password}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex h-9 w-full items-center justify-center rounded-md bg-pink-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-pink-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting
                                    ? 'Creating account...'
                                    : 'Create account'}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="font-medium text-pink-600 hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
};

export const RegisterPage: React.FC = () => (
    <LocalConfigProvider>
        <ThemeProvider>
            <RegisterPageComponent />
        </ThemeProvider>
    </LocalConfigProvider>
);
