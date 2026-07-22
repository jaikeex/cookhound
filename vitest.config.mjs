import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    plugins: [tsconfigPaths()],
    resolve: {
        alias: {
            'server-only': 'next/dist/compiled/server-only/empty.js'
        }
    },
    test: {
        exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
        env: {
            NEXT_PUBLIC_ENV: 'test'
        }
    }
});
