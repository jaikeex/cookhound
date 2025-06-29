import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { SlidingWindowRateLimit } from './limiters/SlidingWindow';
import type { RateLimitConfig, RateLimiter, RateLimitResult } from './types';
import { InfrastructureError } from '@/server/error';
import { Logger } from '@/server/logger';
import { InfrastructureErrorCode } from '@/server/error/codes';

const logger = Logger.getInstance('rate-limit');

//|=============================================================================================|//

enum RateLimitAlgorithm {
    SLIDING_WINDOW = 'sliding-window'
}

export interface RateLimitOptions extends RateLimitConfig {
    onRateLimitExceeded?: (req: NextRequest) => NextResponse;
    algorithm?: RateLimitAlgorithm;
}

/**
 * Higher-order function to wrap App Router handlers with rate limiting
 *
 * @param handler - The handler function to wrap
 * @param options - The options for the rate limiter
 * @returns A new handler function with rate limiting - **THIS IS THE FUNCTION THAT SHOULD BE RETURNED
 *                                                      FROM THE HANDLER FILE.**
 *
 * @example
 * ```ts
 * export const GET = withRateLimit(async (req, context) => {
 *     return new Response('Hello, world!');
 * }, { maxRequests: 10, windowSizeInSeconds: 60 });
 * ```
 */
export function withRateLimit(
    handler: (req: NextRequest, context?: any) => Promise<Response>,
    options: RateLimitOptions
): (req: NextRequest, context?: any) => Promise<Response> {
    return async (req: NextRequest, context?: any): Promise<Response> => {
        logger.info('withRateLimit - guarded reqeust received', {
            path: req.nextUrl.pathname,
            method: req.method
        });

        const rateLimiter = createRateLimiter(options);
        let result: RateLimitResult;

        try {
            const identifier = getAppRouterClientIdentifier(req);
            result = await rateLimiter.checkLimit(identifier);
        } catch (error: unknown) {
            return NextResponse.json(
                { error: 'app.error.default' },
                { status: 500 }
            );
        }

        if (!result.allowed) {
            const response = options.onRateLimitExceeded
                ? options.onRateLimitExceeded(req)
                : NextResponse.json(
                      { error: 'app.error.too-many-requests' },
                      { status: 429 }
                  );

            return response;
        } else {
            return await handler(req, context);
        }
    };
}

function createRateLimiter(options: RateLimitOptions): RateLimiter {
    const algorithm = options.algorithm || RateLimitAlgorithm.SLIDING_WINDOW;
    switch (algorithm) {
        case RateLimitAlgorithm.SLIDING_WINDOW:
        default:
            return new SlidingWindowRateLimit(options);
    }
}

function getAppRouterClientIdentifier(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip'); // Cloudflare

    const path = req.nextUrl.pathname;

    let ip = '';
    if (forwarded) {
        ip = forwarded.split(',')[0].trim();
    } else if (realIp) {
        ip = realIp;
    } else if (cfConnectingIp) {
        ip = cfConnectingIp;
    } else {
        // Fallback to req.ip if available (may not be available in all environments)
        ip = (req as any).ip || 'unknown';
    }

    // Clean up IPv6 mapped IPv4 addresses
    if (ip.startsWith('::ffff:')) {
        ip = ip.slice(7);
    }

    if (ip === 'unknown') {
        //TODO: I don't really know what happens here, since the error thrown here
        //TODO: would not be caught by the handler, and it is not straightforward
        //TODO: to test this...
        logger.error('getAppRouterClientIdentifier - Unknown IP address', {
            ip
        });
        throw new InfrastructureError(
            InfrastructureErrorCode.RATE_LIMIT_UNKNOWN_IP
        );
    }

    return `${ip.trim()}:${path}`;
}
