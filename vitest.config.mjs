import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**']
    }
});
