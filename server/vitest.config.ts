import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        globalSetup: './src/test/global-setup.ts',
        setupFiles: ['./src/test/setup.ts'],
        testTimeout: 30000,
        hookTimeout: 30000,
        include: ['src/**/*.test.ts'],
    },
});
