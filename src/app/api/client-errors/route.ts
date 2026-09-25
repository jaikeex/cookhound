import {
    makeHandler,
    noContent,
    readJson,
    validatePayload
} from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { withRateLimit } from '@/server/utils/rate-limit';
import { z } from 'zod';
import { Logger } from '@/server/logger';
import { registerRouteDocs } from '@/server/utils/api-docs/registry';
import { AuthLevel } from '@/common/types';
import { CLIENT_ERROR_SOURCES } from '@/common/constants';

const log = Logger.getInstance('client-errors');

const RATE_LIMIT = { maxRequests: 10, windowSizeInSeconds: 60 };

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const ClientErrorReportSchema = z.strictObject({
    source: z.enum(CLIENT_ERROR_SOURCES),
    name: z.string().max(200),
    message: z.string().max(1000),
    stack: z.string().max(8000).optional(),
    path: z.string().max(2000)
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles POST requests to `/api/client-errors`: records an unexpected browser-side error.
 * The payload is untrusted and logged at warn level; nothing is persisted.
 */
async function postHandler(request: NextRequest) {
    const payload = validatePayload(
        ClientErrorReportSchema,
        await readJson(request)
    );

    log.warn('client error reported', {
        ...payload,
        userAgent: request.headers.get('user-agent') ?? 'unknown'
    });

    return noContent();
}

export const POST = makeHandler(postHandler, withRateLimit(RATE_LIMIT));

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/client-errors', {
    category: 'Monitoring',
    POST: {
        summary: 'Report an unexpected client-side error.',
        description: `Sent by the browser (sendBeacon) from error boundaries and the global
            error / unhandledrejection listeners in instrumentation-client.ts. Logged only.`,
        auth: AuthLevel.PUBLIC,
        rateLimit: RATE_LIMIT,
        bodySchema: ClientErrorReportSchema,
        responses: {
            204: 'Report accepted',
            400: 'Validation failed',
            429: 'Rate limit exceeded'
        }
    }
});
