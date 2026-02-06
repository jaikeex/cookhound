import path from 'node:path';
import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
    datasource: {
        url: process.env.DATABASE_URL
    },
    schema: path.join(import.meta.dirname, 'src/server/db/schema.prisma'),
    migrations: {
        path: path.join(import.meta.dirname, 'src/server/db/migrations'),
        seed: 'tsx prisma/seed.ts'
    }
});
