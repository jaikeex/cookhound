import IORedis from 'ioredis';
import { ENV_CONFIG_PRIVATE } from '@/common/constants';
import { InfrastructureErrorCode } from '@/common/constants/error-codes';

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
            throw new Error(InfrastructureErrorCode.REDIS_CONNECTION_FAILED, {
                cause: error
            });
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

    /**
     * Atomically set a key only if it does not already exist (SET NX EX).
     *
     * Useful as a throttle/lock gate: the first caller within the TTL window
     * sets the key and gets true; every subsequent caller sees the existing
     * key and gets false until it expires. The check-and-set is a single
     * atomic command, so concurrent callers race for the slot cleanly with no
     * read-then-write window.
     *
     * @returns true if the key was newly set, false if it already existed.
     */
    async setIfAbsent(
        key: string,
        value: unknown,
        ttlInSeconds: number = Number(ENV_CONFIG_PRIVATE.REDIS_TTL)
    ): Promise<boolean> {
        await this.connect();

        const result = await this.client.set(
            key,
            JSON.stringify(value),
            'EX',
            ttlInSeconds,
            'NX'
        );

        return result === 'OK';
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

    /**
     * Register a single key as a member of one or more tag sets in one round
     * trip, refreshing each tag set's TTL.
     *
     * Used by the model cache to make tag-based invalidation possible: when an
     * entry is cached, its key is added to every tag it belongs to. Later, a
     * write drops the tag to evict exactly the entries that tag covers.
     */
    async addKeyToTags(
        key: string,
        tags: readonly string[],
        tagTtlInSeconds: number
    ): Promise<void> {
        if (tags.length === 0) {
            return;
        }

        await this.connect();

        const pipeline = this.client.pipeline();

        for (const tag of tags) {
            pipeline.sadd(tag, key);
            pipeline.expire(tag, tagTtlInSeconds);
        }

        await pipeline.exec();
    }

    /**
     * Evict every cache key tracked by the given tag sets, then remove the tag
     * sets themselves. Two phases: read all members (SMEMBERS) across the tags,
     * then UNLINK the union of member keys plus the tag keys.
     *
     * @returns the number of distinct member keys that were dropped.
     */
    async dropTags(tags: readonly string[]): Promise<number> {
        if (tags.length === 0) {
            return 0;
        }

        await this.connect();

        // Collect the union of member keys across every tag.
        const readPipeline = this.client.pipeline();

        tags.forEach((tag) => readPipeline.smembers(tag));
        const readResults = await readPipeline.exec();

        const keysToDelete = new Set<string>();

        readResults?.forEach(([err, members]) => {
            if (!err && Array.isArray(members)) {
                (members as string[]).forEach((member) =>
                    keysToDelete.add(member)
                );
            }
        });

        // Drop the member keys and the tag sets in one round trip.
        const deletePipeline = this.client.pipeline();

        keysToDelete.forEach((key) => deletePipeline.unlink(key));
        tags.forEach((tag) => deletePipeline.unlink(tag));

        await deletePipeline.exec();

        return keysToDelete.size;
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
