import IORedis from 'ioredis';
import { ENV_CONFIG_PRIVATE } from '@/common/constants';
import { InfrastructureErrorCode } from '@/server/error/codes';

class RedisClient {
    private client: IORedis;
    private isConnected: boolean = false;
    private isConnecting: boolean = false;
    private connectionPromise: Promise<void> | null = null;

    constructor() {
        const redisHost = ENV_CONFIG_PRIVATE.REDIS_HOST;
        const redisPort = Number(ENV_CONFIG_PRIVATE.REDIS_PORT);

        this.client = new IORedis({
            host: redisHost,
            port: redisPort,
            password: ENV_CONFIG_PRIVATE.REDIS_PASSWORD || undefined,
            maxRetriesPerRequest: null,
            enableReadyCheck: true,
            lazyConnect: true
        });

        this.client.on('error', () => {
            this.isConnected = false;
            this.isConnecting = false;
        });

        this.client.on('connect', () => {
            this.isConnected = true;
            this.isConnecting = false;
        });

        this.client.on('close', () => {
            this.isConnected = false;
            this.isConnecting = false;
        });
    }

    async connect(): Promise<IORedis> {
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

            /**
             * Do not throw any ServerError here. Redis connection failing is a
             * critical problem and must be addressed asap, using regular Error
             * here gives additional insurance it will not go unnoticed.
             */
            throw new Error(InfrastructureErrorCode.REDIS_CONNECTION_FAILED);
        }
    }

    async get<T>(key: string): Promise<T | null> {
        await this.connect();
        const value = await this.client.get(key);
        return value ? (JSON.parse(value) as T) : null;
    }

    async set(
        key: string,
        value: unknown,
        ttlInSeconds: number = Number(ENV_CONFIG_PRIVATE.REDIS_TTL)
    ): Promise<void> {
        await this.connect();
        await this.client.set(key, JSON.stringify(value), 'EX', ttlInSeconds);
    }

    async del(key: string): Promise<void> {
        await this.connect();
        await this.client.del(key);
    }

    async keys(pattern: string): Promise<string[]> {
        await this.connect();
        return await this.client.keys(pattern);
    }

    async flushAll(): Promise<void> {
        await this.connect();
        await this.client.flushall();
    }

    /**
     * Get the underlying ioredis client instance.
     * Useful for advanced operations or sharing with other libraries like BullMQ.
     */
    async getClient(): Promise<IORedis> {
        await this.connect();
        return this.client;
    }

    /**
     * Gracefully close the Redis connection.
     */
    async close(): Promise<void> {
        if (this.client) {
            await this.client.quit();
        }
    }
}

const redisClient = new RedisClient();
export default redisClient;
