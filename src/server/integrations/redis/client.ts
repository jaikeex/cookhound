import { createClient } from 'redis';
import { ENV_CONFIG_PRIVATE } from '@/common/constants';
import { Logger } from '@/server/logger';
import { InfrastructureError } from '@/server/error/server';
import { InfrastructureErrorCode } from '@/server/error/codes';

const log = Logger.getInstance('redis-client');

class RedisClient {
    private client;
    private isConnected: boolean = false;
    private isConnecting: boolean = false;
    private connectionPromise: Promise<any> | null = null;

    constructor() {
        this.client = createClient({
            url: `redis://localhost:6379`,
            password: ENV_CONFIG_PRIVATE.REDIS_PASSWORD
        });

        this.client.on('error', (error: Error) =>
            log.error('Redis Client Error:', error)
        );
        this.client.on('connect', () => {
            this.isConnected = true;
            this.isConnecting = false;
        });
        this.client.on('disconnect', () => {
            this.isConnected = false;
            this.isConnecting = false;
        });
    }

    async connect() {
        if (this.isConnected) {
            return this.client;
        }

        if (this.isConnecting && this.connectionPromise) {
            await this.connectionPromise;
            return this.client;
        }

        this.isConnecting = true;
        this.connectionPromise = this.client.connect();

        try {
            await this.connectionPromise;
            return this.client;
        } catch (error: unknown) {
            this.isConnecting = false;
            this.connectionPromise = null;
            throw new InfrastructureError(
                InfrastructureErrorCode.REDIS_CONNECTION_FAILED
            );
        }
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

const redisClient = new RedisClient();
export default redisClient;
