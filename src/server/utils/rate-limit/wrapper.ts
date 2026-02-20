import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { SlidingWindowRateLimit } from './limiters/SlidingWindow';
import type { RateLimitConfig, RateLimiter, RateLimitResult } from './types';
import { InfrastructureError } from '@/server/error';
import { Logger } from '@/server/logger';
import { InfrastructureErrorCode } from '@/server/error/codes';
import { isE2ETestMode } from '@/common/constants';

const logger = Logger.getInstance('rate-limit');

//|=============================================================================================|//

enum RateLimitAlgorithm {
    SLIDING_WINDOW = 'sliding-window'
}

export interface RateLimitOptions extends RateLimitConfig {
    onRateLimitExceeded?: (req: NextRequest) => NextResponse;
    algorithm?: RateLimitAlgorithm;
}

export function withRateLimit(
    options: RateLimitOptions
): <T extends (req: NextRequest, context?: unknown) => Promise<Response>>(
    handler: T
) => T {
    return <
        T extends (req: NextRequest, context?: unknown) => Promise<Response>
    >(
        handler: T
    ): T => {
        return (async (
            req: NextRequest,
            context?: unknown
        ): Promise<Response> => {
            if (isE2ETestMode()) {
                //! Skip rate limiting in e2e tests
                return handler(req, context);
            }

            logger.info('withRateLimit - guarded request received', {
                path: req.nextUrl.pathname,
                method: req.method
            });

            const rateLimiter = createRateLimiter(options);
            let result: RateLimitResult;

            try {
                const identifier = getAppRouterClientIdentifier(req);
                result = await rateLimiter.checkLimit(identifier);
            } catch (error: unknown) {
                // fail open in case of redis is outage
                logger.warn('withRateLimit - skipping rate limit', {
                    path: req.nextUrl.pathname
                });

                return handler(req, context);
            }

            if (!result.allowed) {
                const response = options.onRateLimitExceeded
                    ? options.onRateLimitExceeded(req)
                    : NextResponse.json(
                          { error: 'app.error.too-many-requests' },
                          { status: 429 }
                      );

                return response;
            }

            return handler(req, context);
        }) as T;
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
    //?—————————————————————————————————————————————————————————————————————————————————————————?//
    //?                                      IP SPOOFING                                        ?//
    ///
    //# These checks MUST be paired with proper reverse proxy configuration.
    //# In case of the current deployment, the do droplet has an nginx instance running, and
    //# it must be configured to reset the headers to its proper actual values read from the
    //# connection itself, not from the request headers, since those can be set arbitrarily
    //# by the caller.
    //#
    //# The correct nginx config is as follows:
    //#
    //#     # Clear incoming client IP headers to prevent spoofing
    //#     proxy_set_header X-Real-IP "";
    //#     proxy_set_header X-Forwarded-For "";
    //#
    //#     # Set the X-Real-IP header to the real remote address
    //#     proxy_set_header X-Real-IP $remote_addr;
    //#
    //#     # Append the remote address to the X-Forwarded-For header
    //#     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    ///
    //?—————————————————————————————————————————————————————————————————————————————————————————?//

    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');

    const path = req.nextUrl.pathname;

    let ip = '';

    if (forwarded) {
        ip = forwarded.split(',')[0]?.trim() ?? '';
    } else if (realIp) {
        ip = realIp;
    } else {
        // Fallback to req.ip if available (may not be available in all environments)
        ip = (req as any).ip || 'unknown';
    }

    // Clean up IPv6 mapped IPv4 addresses
    if (ip.startsWith('::ffff:')) {
        ip = ip.slice(7);
    }

    if (ip === 'unknown') {
        // I don't really know what happens here, since the error thrown here
        // would not be caught by the handler, and it is not straightforward
        // to test this...
        logger.error('getAppRouterClientIdentifier - Unknown IP address', {
            ip
        });

        throw new InfrastructureError(
            InfrastructureErrorCode.RATE_LIMIT_UNKNOWN_IP
        );
    }

    return `${ip.trim()}:${path}`;
}
