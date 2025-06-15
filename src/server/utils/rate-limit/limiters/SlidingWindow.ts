import type {
    RateLimitConfig,
    RateLimiter,
    RateLimitResult
} from '@/server/utils/rate-limit/types';
import { redisClient } from '@/server/db/redis';

export class SlidingWindowRateLimit implements RateLimiter {
    private config: Required<RateLimitConfig>;

    constructor(config: RateLimitConfig) {
        this.config = {
            windowSizeInSeconds: config.windowSizeInSeconds,
            maxRequests: config.maxRequests,
            subWindowCount: config.subWindowCount || 10,
            keyGenerator:
                config.keyGenerator || ((id: string) => `rate_limit:${id}`)
        };
    }

    async checkLimit(identifier: string): Promise<RateLimitResult> {
        const now = Date.now();
        const windowSizeMs = this.config.windowSizeInSeconds * 1000;
        const subWindowSizeMs = windowSizeMs / this.config.subWindowCount;

        const currentSubWindow = Math.floor(now / subWindowSizeMs);
        const key = this.config.keyGenerator(identifier);

        const subWindowKeys = [];

        // Build Redis keys for all sub-windows that make up the current sliding window.
        for (let i = 0; i < this.config.subWindowCount; i++) {
            const subWindowKey = `${key}:${currentSubWindow - i}`;
            subWindowKeys.push(subWindowKey);
        }

        // Fetch request counts for all sub-windows.
        const subWindowCounts = await Promise.all(
            subWindowKeys.map(async (subKey) => {
                const count = await redisClient.get<number>(subKey);
                return count || 0;
            })
        );

        // Sum up all requests across the sliding window segments to get total count.
        const totalRequests = subWindowCounts.reduce(
            (sum, count) => sum + count,
            0
        );

        const allowed = totalRequests < this.config.maxRequests;

        if (allowed) {
            // Increment the counter for the current sub-window ONLY if the request is allowed
            // The TTL is set to the full window size to ensure old sub-windows automatically expire.
            const currentSubWindowKey = `${key}:${currentSubWindow}`;
            const currentCount =
                (await redisClient.get<number>(currentSubWindowKey)) || 0;

            await redisClient.set(
                currentSubWindowKey,
                currentCount + 1,
                this.config.windowSizeInSeconds
            );
        }

        const remainingRequests = Math.max(
            0,
            this.config.maxRequests - totalRequests - (allowed ? 1 : 0)
        );

        return {
            allowed,
            remainingRequests,
            totalRequests: totalRequests + (allowed ? 1 : 0)
        };
    }

    async resetLimit(identifier: string): Promise<void> {
        const key = this.config.keyGenerator(identifier);
        const pattern = `${key}:*`;
        const keys = await redisClient.keys(pattern);

        await Promise.all(keys.map((key) => redisClient.del(key)));
    }
}
