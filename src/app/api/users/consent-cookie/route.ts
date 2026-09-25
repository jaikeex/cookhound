import type { NextRequest } from 'next/server';
import {
    makeHandler,
    noContent,
    readJson,
    validatePayload
} from '@/server/utils/reqwest';
import { setCookie } from '@/server/utils/reqwest/cookies';
import { z } from 'zod';
import { withRateLimit } from '@/server/utils/rate-limit';
import { registerRouteDocs } from '@/server/utils/api-docs/registry';
import { AuthLevel } from '@/common/types';
import {
    CONSENT_COOKIE_MAX_AGE,
    CONSENT_COOKIE_NAME
} from '@/common/constants';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const ConsentCookieSchema = z.strictObject({
    consent: z.boolean(),
    version: z.string().trim().min(1).max(32),
    createdAt: z.coerce.date(),
    accepted: z
        .array(z.enum(['essential', 'preferences', 'analytics', 'marketing']))
        .max(4),
    userId: z
        .union([z.string().max(32), z.number().int()])
        .transform(String)
        .nullable()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles PUT requests to `/api/users/consent-cookie` to write the browser consent cookie.
 *
 * @param request - The incoming Next.js request object containing the consent.
 * @returns An empty response carrying the Set-Cookie header.
 *
 * - 204: Cookie set.
 * - 400: Bad Request, if validation fails.
 * - 429: Too Many Requests, if rate limit exceeded.
 */
async function putHandler(request: NextRequest) {
    const rawPayload = await readJson(request);

    const payload = validatePayload(ConsentCookieSchema, rawPayload);

    await setCookie(
        CONSENT_COOKIE_NAME,
        encodeURIComponent(JSON.stringify(payload)),
        {
            maxAge: CONSENT_COOKIE_MAX_AGE,
            sameSite: 'lax'
        }
    );

    return noContent();
}

export const PUT = makeHandler(
    putHandler,
    withRateLimit({
        maxRequests: 30,
        windowSizeInSeconds: 60 * 60 // 1 hour
    })
);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/users/consent-cookie', {
    category: 'Users',
    subcategory: 'Compliance',
    PUT: {
        summary: 'Write the browser cookie consent cookie.',
        description: `Sets the non-httpOnly consent cookie read by the client
            ConsentProvider. Works for anonymous users too. The audit trail for
            logged-in users is stored separately via
            POST /api/users/me/cookie-consent.`,
        auth: AuthLevel.PUBLIC,
        rateLimit: { maxRequests: 30, windowSizeInSeconds: 3600 },
        bodySchema: ConsentCookieSchema,
        clientUsage: [
            {
                apiClient: 'apiClient.user.setConsentCookie',
                hook: 'chqc.user.useSetConsentCookie'
            }
        ],
        responses: {
            204: 'Cookie set',
            400: 'Validation failed',
            429: 'Rate limit exceeded'
        }
    }
});
