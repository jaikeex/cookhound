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

    //~-----------------------------------------------------------------------------------------~//
    //$                                     SET OPERATIONS                                      $//
    //~-----------------------------------------------------------------------------------------~//

    async sadd(
        key: string,
        member: string,
        ttlInSeconds?: number
    ): Promise<void> {
        await this.connect();

        if (ttlInSeconds) {
            const pipeline = this.client.pipeline();
            pipeline.sadd(key, member);
            pipeline.expire(key, ttlInSeconds);

            await pipeline.exec();
        } else {
            await this.client.sadd(key, member);
        }
    }

    async srem(key: string, member: string): Promise<void> {
        await this.connect();
        await this.client.srem(key, member);
    }

    async smembers(key: string): Promise<string[]> {
        await this.connect();
        return this.client.smembers(key);
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                   COUNTER OPERATIONS                                    $//
    //~-----------------------------------------------------------------------------------------~//

    async incr(key: string, ttlInSeconds?: number): Promise<number> {
        await this.connect();

        if (ttlInSeconds) {
            const pipeline = this.client.pipeline();
            pipeline.incr(key);
            pipeline.expire(key, ttlInSeconds);

            const results = await pipeline.exec();

            if (results?.[0]?.[0]) {
                throw results[0][0];
            }

            return (results?.[0]?.[1] as number) ?? 0;
        }

        return this.client.incr(key);
    }

    async decr(key: string): Promise<number> {
        await this.connect();
        return this.client.decr(key);
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                    SCAN / KEY LOOKUP                                    $//
    //~-----------------------------------------------------------------------------------------~//

    async keys(pattern: string): Promise<string[]> {
        await this.connect();
        const keys: string[] = [];

        let cursor = '0';

        do {
            const [nextCursor, batch] = await this.client.scan(
                cursor,
                'MATCH',
                pattern,
                'COUNT',
                100
            );

            cursor = nextCursor;
            keys.push(...batch);
        } while (cursor !== '0');

        return keys;
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
