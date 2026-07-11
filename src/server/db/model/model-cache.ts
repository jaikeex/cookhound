import { redisClient } from '@/server/integrations';
import {
    ENV_CONFIG_PRIVATE,
    ONE_DAY_IN_SECONDS,
    ONE_HOUR_IN_SECONDS,
    ONE_MINUTE_IN_SECONDS
} from '@/common/constants';
import { Logger } from '@/server/logger';

//|=============================================================================================|//

const log = Logger.getInstance('model-cache');

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                      CACHING STRATEGY                                       ?//
///
//# The caching strategy for db access in this project is as follows:
//#
//# QUERY CLASSIFICATION:
//#
//#   C1 (high traffic, mildly stale OK)           -> cache with short ttl (TTL_1)
//#   C2 (high traffic, rarely updated data)       -> cache with medium ttl (TTL_2)
//#   C3 (frequently updated or must be real-time) -> no cache (TTL = 0)
//#
//# WRITE CLASSIFICATION:
//#   W1 (must be immediately visible)             -> invalidate related cache
//#   W2 (mildly stale OK data)                    -> do not invalidate the cache
//#   W3 (newly created data)                      -> invalidate related cache
//#
//# KEY POINTS:
//#   - TTL constants live in CACHE_TTL enum – never hard-code numbers.
//#
//# INVALIDATION (W1/W3):
//#   - Invalidation is TAG-BASED, not pattern/scan-based. Each cached read declares the tags
//#     it belongs to (last arg of cachePrismaQuery); each write drops the tags it affects via
//#     invalidateTags(). Tags are defined once in CACHE_TAGS below — that registry is the single
//#     place to audit which reads a given write clears. A read tagged with a tag no writer drops
//#     will only ever expire on its ttl; a writer dropping a tag no read registers is a harmless
//#     no-op. Keep the two sides in lockstep through CACHE_TAGS.
//#   - Cost is O(entries actually tracked), never O(keyspace): no KEYS/SCAN over shared Redis.
//#
//# OR, in other words:
//#
//# (1) Queries that need not display info up to date (especially high demand ones)
//#     SHOULD be cached at all times with a reasonable ttl.
//#
//# (2) Queries for data expected to rarely change SHOULD be cached, because the invalidation
//#     logic is generally easy to deal with (e.g. user credentials).
//#
//# (3) Queries expected to return up to date info at all times SHOULD NOT be cached,
//#     unless you want to deal with all the invalidation shit... (e.g. )
//#
//# (4) Only invalidate the cache when changing data thtat are required to be up to date.
//#     (e.g. recipe instructions update). ttls should be used instead wherever possible.
//#
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

export const CACHE_TTL = {
    TTL_1: ONE_MINUTE_IN_SECONDS, // C1 - 1 minute
    TTL_2: ONE_HOUR_IN_SECONDS * 6 // C2 - 6 hours
} as const;

/**
 * A tag set MUST outlive every entry it tracks. If a tag expired
 * while a member entry was still cached, that entry would become unreachable
 * by any write and could only self-heal on its own TTL and become silently stale.
 */
export const CACHE_TAG_TTL = ONE_DAY_IN_SECONDS;

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                      INVALIDATION TAGS                                      ?//
///
//# Every cached read declares the tags it belongs to; every write drops the tags it affects.
//# This registry is the single place that maps the C/W tier system onto concrete
//# invalidation groups. When adding a cached query, pick or add the tag(s) that the relevant
//# writes already drop. Do not invent a tag no writer touches.
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

export const CACHE_TAGS = {
    recipe: {
        entity: (id: number) => `tag:recipe:id:${id}`,
        byDisplayId: (displayId: string) => `tag:recipe:displayId:${displayId}`,
        ownedBy: (userId: number) => `tag:recipe:user:${userId}`
    },
    cookbook: {
        entity: (id: number) => `tag:cookbook:id:${id}`,
        ownedBy: (ownerId: number) => `tag:cookbook:owner:${ownerId}`
    },
    bookmark: {
        ownedBy: (userId: number) => `tag:bookmark:user:${userId}`
    },
    user: {
        entity: (id: number) => `tag:user:${id}`
    },
    emailChangeRequest: {
        byToken: (token: string) => `tag:emailChangeRequest:token:${token}`
    },
    accountDeletionRequest: {
        entity: (id: number) => `tag:accountDeletionRequest:id:${id}`,
        ownedBy: (userId: number) => `tag:accountDeletionRequest:user:${userId}`
    }
} as const;

/**
 * The tags a cache entry belongs to. Either a static list known upfront, or a
 * function of the fetched value.
 */
export type CacheTagsInput<T> =
    readonly string[] | ((result: T) => readonly string[]);

/**
 * Generic cache wrapper for Prisma queries.
 *
 * @param key - Unique cache key
 * @param fetchFn - Function that returns the data to cache
 * @param ttl - Time to live in seconds (default: REDIS_TTL env)
 * @param tags - Tag set membership for this entry, used for targeted invalidation.
 */
export async function cachePrismaQuery<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = Number(ENV_CONFIG_PRIVATE.REDIS_TTL),
    tags?: CacheTagsInput<T>
): Promise<T> {
    if (ttl <= 0) {
        return fetchFn();
    }

    try {
        const now = new Date();
        const cachedData = await redisClient.get<T>(key);

        if (cachedData !== null) {
            log.trace(`Cache hit for key: ${key}`);
            const time = new Date().getTime() - now.getTime();

            log.trace(
                `Time to fetch data from cache for key: ${key}: ${time}ms`
            );

            return cachedData;
        }
    } catch (error: unknown) {
        log.warn('Redis read failed, falling through to database', {
            key,
            error
        });
    }

    log.trace(`Cache miss for key: ${key}`);
    const data = await fetchFn();

    try {
        //?—————————————————————————————————————————————————————————————————————————————————————?//
        //?                                 ORDER MATTERS HERE                                  ?//
        ///
        //# Tag membership MUST be registered before the entry is written. If registration fails,
        //# the entry is simply never cached (safe); the reverse order could cache an entry no
        //# tag tracks, leaving it invisible to every invalidation until its TTL. A dangling tag
        //# member from a failed set is the harmless direction, droptags just unlinks
        //# a key that does not exist.
        ///
        //?—————————————————————————————————————————————————————————————————————————————————————?//

        if (tags) {
            const resolvedTags = typeof tags === 'function' ? tags(data) : tags;

            if (resolvedTags.length > 0) {
                await redisClient.addKeyToTags(
                    key,
                    resolvedTags,
                    CACHE_TAG_TTL
                );
            }
        }

        await redisClient.set(key, data, ttl);
    } catch (error: unknown) {
        log.warn('Redis write failed, skipping cache population', {
            key,
            error
        });
    }

    return data;
}

/**
 * Invalidate cache for a specific key
 * @param key - Cache key to invalidate
 */
export async function invalidateCache(key: string): Promise<void> {
    try {
        await redisClient.del(key);
    } catch (error: unknown) {
        log.warn('Redis invalidation failed', { key, error });
    }
}

/**
 * Invalidate every cache entry registered under the given tags, and remove the tag sets themselves.
 * Fails open — a Redis failure is logged and swallowed, leaving entries to expire on their own TTL.
 *
 * @param tags - Tags to drop. Duplicates are harmless.
 */
export async function invalidateTags(tags: readonly string[]): Promise<void> {
    if (tags.length === 0) {
        return;
    }

    try {
        const evicted = await redisClient.dropTags(tags);

        if (evicted > 0) {
            log.trace(
                `Invalidated ${evicted} cache entries across tags: ${tags.join(', ')}`
            );
        }
    } catch (error: unknown) {
        log.warn('Tag invalidation failed', { tags, error });
    }
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
