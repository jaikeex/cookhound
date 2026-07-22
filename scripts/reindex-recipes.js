#!/usr/bin/env node

// Enqueues a one-off full Typesense recipe reindex (the same job the nightly
// cron runs). Use after deploys that change the collection schema — the job
// drops the collection, boot recreates it from the current field array, and
// every recipe is upserted fresh. Requires the worker process to be running.

import { Queue } from 'bullmq';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const redisPassword = process.env.REDIS_PASSWORD;
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';

if (!redisPassword) {
    console.error('Error: REDIS_PASSWORD environment variable is not set');
    process.exit(1);
}

// Must match QUEUE_NAMES.SEARCH / JOB_NAMES.REINDEX_RECIPES on the server
const QUEUE_NAME = 'search';
const JOB_NAME = 'reindex-recipes';

console.log(`Enqueuing ${JOB_NAME} on queue "${QUEUE_NAME}"...`);

const queue = new Queue(QUEUE_NAME, {
    connection: {
        host: redisHost,
        port: parseInt(redisPort),
        password: redisPassword
    }
});

try {
    const job = await queue.add(JOB_NAME, {});

    console.log(`✓ Reindex job enqueued (id: ${job.id})`);
    console.log('Watch the worker logs for "Recipe re-index job finished".');

    await queue.close();

    process.exit(0);
} catch (error) {
    console.error('Failed to enqueue reindex job:', error.message);

    await queue.close();

    process.exit(1);
}
