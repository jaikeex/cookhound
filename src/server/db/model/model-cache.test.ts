import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

//|=============================================================================================|//
//$                                           MOCKS                                             $//
//|=============================================================================================|//

import type * as ServerIntegrations from '@/server/integrations';

vi.mock('@/server/integrations', async (importOriginal) => ({
    ...(await importOriginal<typeof ServerIntegrations>()),
    redisClient: {
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn(),
        addKeyToTags: vi.fn(),
        dropTags: vi.fn()
    }
}));

//|=============================================================================================|//
//$                                          IMPORTS                                            $//
//|=============================================================================================|//

import { redisClient } from '@/server/integrations';
import { CACHE_TAG_TTL, cachePrismaQuery, invalidateTags } from './model-cache';

const mockRedis = vi.mocked(redisClient);

//|=============================================================================================|//
//$                                           TESTS                                             $//
//|=============================================================================================|//

describe('cachePrismaQuery — tag registration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (mockRedis.get as Mock).mockResolvedValue(null);
        (mockRedis.set as Mock).mockResolvedValue(undefined);
        (mockRedis.addKeyToTags as Mock).mockResolvedValue(undefined);
    });

    it('registers static tags into the tag sets on a cache miss', async () => {
        const fetchFn = vi.fn().mockResolvedValue({ id: 7 });

        const result = await cachePrismaQuery('k1', fetchFn, 60, [
            'tag:recipe:id:7'
        ]);

        expect(result).toEqual({ id: 7 });
        expect(fetchFn).toHaveBeenCalledOnce();
        expect(mockRedis.set).toHaveBeenCalledWith('k1', { id: 7 }, 60);
        expect(mockRedis.addKeyToTags).toHaveBeenCalledWith(
            'k1',
            ['tag:recipe:id:7'],
            CACHE_TAG_TTL
        );

        // Tags must be registered BEFORE the entry is written — if the order
        // ever flips, a failure between the two calls caches an entry no tag
        // tracks, unreachable by any invalidation until its TTL.
        const tagOrder = (mockRedis.addKeyToTags as Mock).mock
            .invocationCallOrder[0];
        const setOrder =
            (mockRedis.set as Mock).mock.invocationCallOrder[0] ?? 0;

        expect(tagOrder).toBeLessThan(setOrder);
    });

    it('resolves function tags from the fetched result', async () => {
        const fetchFn = vi.fn().mockResolvedValue({ id: 42 });

        await cachePrismaQuery('k2', fetchFn, 60, (user) =>
            user ? [`tag:user:${(user as { id: number }).id}`] : []
        );

        expect(mockRedis.addKeyToTags).toHaveBeenCalledWith(
            'k2',
            ['tag:user:42'],
            CACHE_TAG_TTL
        );
    });

    it('skips tag registration when the result yields no tags', async () => {
        const fetchFn = vi.fn().mockResolvedValue(null);

        await cachePrismaQuery('k3', fetchFn, 60, (user) =>
            user ? [`tag:user:${(user as { id: number }).id}`] : []
        );

        expect(mockRedis.set).toHaveBeenCalledOnce();
        expect(mockRedis.addKeyToTags).not.toHaveBeenCalled();
    });

    it('does NOT re-register tags on a cache hit', async () => {
        (mockRedis.get as Mock).mockResolvedValue({ id: 7 });
        const fetchFn = vi.fn();

        const result = await cachePrismaQuery('k4', fetchFn, 60, [
            'tag:recipe:id:7'
        ]);

        expect(result).toEqual({ id: 7 });
        expect(fetchFn).not.toHaveBeenCalled();
        expect(mockRedis.set).not.toHaveBeenCalled();
        expect(mockRedis.addKeyToTags).not.toHaveBeenCalled();
    });

    it('bypasses redis entirely (no fetch tagging) when ttl <= 0', async () => {
        const fetchFn = vi.fn().mockResolvedValue({ id: 1 });

        const result = await cachePrismaQuery('k5', fetchFn, 0, [
            'tag:recipe:id:1'
        ]);

        expect(result).toEqual({ id: 1 });
        expect(fetchFn).toHaveBeenCalledOnce();
        expect(mockRedis.get).not.toHaveBeenCalled();
        expect(mockRedis.set).not.toHaveBeenCalled();
        expect(mockRedis.addKeyToTags).not.toHaveBeenCalled();
    });

    it('still returns data when tag registration fails (fails open)', async () => {
        (mockRedis.addKeyToTags as Mock).mockRejectedValue(
            new Error('redis down')
        );
        const fetchFn = vi.fn().mockResolvedValue({ id: 9 });

        const result = await cachePrismaQuery('k6', fetchFn, 60, [
            'tag:recipe:id:9'
        ]);

        expect(result).toEqual({ id: 9 });

        // The entry must NOT be cached when its tags could not be registered,
        // otherwise it would serve stale data invisible to invalidation.
        expect(mockRedis.set).not.toHaveBeenCalled();
    });
});

describe('invalidateTags', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('delegates to redisClient.dropTags with the given tags', async () => {
        (mockRedis.dropTags as Mock).mockResolvedValue(3);

        await invalidateTags(['tag:recipe:user:5', 'tag:recipe:id:7']);

        expect(mockRedis.dropTags).toHaveBeenCalledWith([
            'tag:recipe:user:5',
            'tag:recipe:id:7'
        ]);
    });

    it('is a no-op with no round trip for an empty tag list', async () => {
        await invalidateTags([]);
        expect(mockRedis.dropTags).not.toHaveBeenCalled();
    });

    it('swallows redis failures (fails open)', async () => {
        (mockRedis.dropTags as Mock).mockRejectedValue(new Error('redis down'));

        await expect(
            invalidateTags(['tag:recipe:user:5'])
        ).resolves.toBeUndefined();
    });
});
