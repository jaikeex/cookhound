import { createClient } from 'redis';
import { ENV_CONFIG_PRIVATE } from '@/common/constants';

class RedisClient {
    private client;
    private isConnected: boolean = false;

    constructor() {
        this.client = createClient({
            url: `redis://localhost:6379`,
            password: ENV_CONFIG_PRIVATE.REDIS_PASSWORD
        });

        this.client.on('error', (err: Error) =>
            console.error('Redis Client Error:', err)
        );
        this.client.on('connect', () => (this.isConnected = true));
        this.client.on('disconnect', () => (this.isConnected = false));
    }

    async connect() {
        if (!this.isConnected) {
            await this.client.connect();
        }
        return this.client;
    }

    async get<T>(key: string): Promise<T | null> {
        const client = await this.connect();
        const value = await client.get(key);
        return value ? (JSON.parse(value) as T) : null;
    }

    async set(
        key: string,
        value: any,
        ttlInSeconds: number = Number(ENV_CONFIG_PRIVATE.REDIS_TTL)
    ): Promise<void> {
        const client = await this.connect();
        await client.set(key, JSON.stringify(value), { EX: ttlInSeconds });
    }

    async del(key: string): Promise<void> {
        const client = await this.connect();
        await client.del(key);
    }

    async keys(pattern: string): Promise<string[]> {
        const client = await this.connect();
        return await client.keys(pattern);
    }

    async flushAll(): Promise<void> {
        const client = await this.connect();
        await client.flushAll();
    }
}

// Create a singleton instance
export const redisClient = new RedisClient();
