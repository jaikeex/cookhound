#!/usr/bin/env node

import Redis from 'ioredis';
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

console.log(`Flushing Redis at ${redisHost}:${redisPort}...`);

const redis = new Redis({
    host: redisHost,
    port: parseInt(redisPort),
    password: redisPassword,
    lazyConnect: true
});

redis.on('error', (error) => {
    console.error('Redis connection error:', error.message);
    process.exit(1);
});

try {
    await redis.connect();
    await redis.flushall();

    console.log('✓ Redis flushed successfully');

    await redis.quit();

    process.exit(0);
} catch (error) {
    console.error('Failed to flush Redis:', error.message);

    await redis.quit();

    process.exit(1);
}
