import type {
    RateLimitConfig,
    RateLimiter,
    RateLimitResult
} from '@/server/utils/rate-limit/types';
import { redisClient } from '@/server/integrations';
import { Logger } from '@/server/logger';

const log = Logger.getInstance('rate-limit');

//|=============================================================================================|//

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
        const currentSubWindowKey = `${key}:${currentSubWindow}`;

        // Atomically increment the current sub-window FIRST to claim a slot.
        // INCR is atomic in redis, so concurrent requests each get a unique count.
        // NOTE: INCR re-applies the TTL on every call via a pipeline (INCR + EXPIRE),
        // which slightly extends the sub-window's expiration on each request.
        // This is a minor inaccuracy inherent to sub-window rate limiting and is
        // acceptable in practice, the drift is bounded by subWindowSize.
        const newCurrentCount = await redisClient.incr(
            currentSubWindowKey,
            this.config.windowSizeInSeconds
        );

        // Fetch request counts for all OTHER sub-windows in the sliding window.
        const otherSubWindowKeys: string[] = [];

        for (let i = 1; i < this.config.subWindowCount; i++) {
            otherSubWindowKeys.push(`${key}:${currentSubWindow - i}`);
        }

        const otherCounts = await Promise.all(
            otherSubWindowKeys.map(async (subKey) => {
                const count = await redisClient.get<number>(subKey);
                return count || 0;
            })
        );

        const totalRequests =
            newCurrentCount +
            otherCounts.reduce((sum, count) => sum + count, 0);

        if (totalRequests > this.config.maxRequests) {
            // Over the limit, roll back the optimistic increment.
            try {
                await redisClient.decr(currentSubWindowKey);
            } catch (error: unknown) {
                log.warn(
                    'checkLimit - failed to roll back optimistic increment',
                    { error, key: currentSubWindowKey }
                );
            }

            return {
                allowed: false,
                remainingRequests: 0,
                totalRequests: totalRequests - 1
            };
        }

        return {
            allowed: true,
            remainingRequests: Math.max(
                0,
                this.config.maxRequests - totalRequests
            ),
            totalRequests
        };
    }

    async resetLimit(identifier: string): Promise<void> {
        const key = this.config.keyGenerator(identifier);
        const pattern = `${key}:*`;
        const keys = await redisClient.keys(pattern);

        await Promise.all(keys.map((key) => redisClient.del(key)));
    }
}
