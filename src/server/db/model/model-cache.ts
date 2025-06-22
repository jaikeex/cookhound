import { redisClient } from '@/server/db/redis';
import { ENV_CONFIG_PRIVATE } from '@/common/constants';
import { Logger } from '@/server/logger';

//|=============================================================================================|//

const log = Logger.getInstance('model-cache');

/**
 * Generic cache wrapper for Prisma queries
 * @param key - Unique cache key
 * @param fetchFn - Function that returns the data to cache
 * @param ttl - Time to live in seconds (default: 300 seconds / 5 minutes)
 */
export async function cachePrismaQuery<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = Number(ENV_CONFIG_PRIVATE.REDIS_TTL)
): Promise<T> {
    const now = new Date();

    const cachedData = await redisClient.get<T>(key);

    if (cachedData !== null) {
        log.trace(`Cache hit for key: ${key}`);
        const time = new Date().getTime() - now.getTime();
        log.trace(`Time to fetch data from cache for key: ${key}: ${time}ms`);
        return cachedData;
    }

    log.trace(`Cache miss for key: ${key}`);
    const data = await fetchFn();

    await redisClient.set(key, data, ttl);

    return data;
}

/**
 * Invalidate cache for a specific key
 * @param key - Cache key to invalidate
 */
export async function invalidateCache(key: string): Promise<void> {
    await redisClient.del(key);
}

/**
 * Invalidate all cache keys matching a pattern
 * @param pattern - Redis pattern to match (e.g., "prisma:user:*")
 */
export async function invalidateCacheByPattern(pattern: string): Promise<void> {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
        await Promise.all(keys.map((key) => redisClient.del(key)));

        log.trace(
            `Invalidated ${keys.length} cache entries matching pattern: ${pattern}`
        );
    }
}

/**
 * ULTIMATE cache invalidation solution - automatically invalidates cache for any model
 * based on changed fields. This approach SHOULD require no manual maintenance...
 * Until it breaks...
 *
 * @param modelName - Name of the Prisma model
 * @param changedData - Object containing the fields that changed
 * @param originalData - Original data before changes (optional, for more precise invalidation)
 */
export async function invalidateModelCache(
    modelName: string,
    changedData: Record<string, any>,
    originalData?: Record<string, any>
): Promise<void> {
    const patterns = new Set<string>();

    // Add patterns for each changed field (targeted invalidation only)
    Object.entries(changedData).forEach(([field, value]) => {
        if (value !== undefined && value !== null) {
            const valueStr =
                typeof value === 'string' ? `"${value}"` : String(value);
            patterns.add(`prisma:${modelName}:*"${field}":${valueStr}*`);
        }
    });

    // If we have original data, also invalidate patterns for the old values
    if (originalData) {
        Object.entries(originalData).forEach(([field, value]) => {
            if (value !== undefined && value !== null && field in changedData) {
                const valueStr =
                    typeof value === 'string' ? `"${value}"` : String(value);
                patterns.add(`prisma:${modelName}:*"${field}":${valueStr}*`);
            }
        });
    }

    // Invalidate all unique patterns
    await Promise.all(
        Array.from(patterns).map((pattern) => invalidateCacheByPattern(pattern))
    );
}

/**
 * Generates a key for a Prisma query cache entry.
 *
 * @param modelName - Name of the Prisma model
 * @param operation - Operation type (findUnique, findMany, etc.)
 * @param params - Query parameters
 */
export function generateCacheKey(
    modelName: string,
    operation: string,
    params?: Record<string, any>
): string {
    return `prisma:${modelName}:${operation}:${params ? JSON.stringify(params) : ''}`;
}
