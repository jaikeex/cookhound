import {
    ENV_CONFIG_PRIVATE,
    REVALIDATE_TOKEN_HEADER,
    ROUTES
} from '@/common/constants';
import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';
import { makeHandler, ok } from '@/server/utils/reqwest';
import { withRateLimit } from '@/server/utils/rate-limit/wrapper';
import { AuthErrorUnauthorized, ValidationError } from '@/server/error';
import { registerRouteDocs } from '@/server/utils/api-docs/registry';
import { AuthLevel } from '@/common/types';

//|=============================================================================================|//
//?                                        VALIDATION                                          ?//
//|=============================================================================================|//

const RECIPE_DETAIL_PREFIX = ROUTES.recipe.detail('');
const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isRevalidatablePath = (path: string): boolean => {
    if (!path.startsWith(RECIPE_DETAIL_PREFIX)) {
        return false;
    }

    const displayId = path.slice(RECIPE_DETAIL_PREFIX.length);
    return UUID_RE.test(displayId);
};

const isTokenValid = (provided: string | null): boolean => {
    if (!provided) {
        return false;
    }

    const providedHash = createHash('sha256').update(provided).digest();
    const expectedHash = createHash('sha256')
        .update(ENV_CONFIG_PRIVATE.REVALIDATE_PATH_TOKEN)
        .digest();

    return timingSafeEqual(providedHash, expectedHash);
};

//|=============================================================================================|//
//?                                          HANDLER                                           ?//
//|=============================================================================================|//

/**
 * Handles GET requests to `/api/revalidate` to revalidate a Next.js cache path on demand.
 *
 * @param request - The incoming request; carries the token header and a path query parameter.
 * @returns { revalidated: true } on success.
 * @throws {AuthErrorUnauthorized} If the token is missing or invalid (401).
 * @throws {ValidationError} If the path is missing or not an allowlisted recipe path (400).
 */
async function getHandler(request: NextRequest) {
    const token = request.headers.get(REVALIDATE_TOKEN_HEADER);

    if (!isTokenValid(token)) {
        throw new AuthErrorUnauthorized();
    }

    const path = request.nextUrl.searchParams.get('path');

    if (!path || !isRevalidatablePath(path)) {
        throw new ValidationError();
    }

    revalidatePath(path);

    return ok({ revalidated: true });
}

export const GET = makeHandler(
    getHandler,
    withRateLimit({ maxRequests: 30, windowSizeInSeconds: 60 })
);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/revalidate', {
    category: 'Revalidation',
    GET: {
        summary: 'Revalidate a Next.js recipe page cache by path.',
        description: 'Triggers on-demand ISR for a recipe detail path.',
        auth: AuthLevel.PUBLIC,
        responses: {
            200: 'Revalidation result',
            400: 'Missing or disallowed path',
            401: 'Missing or invalid revalidation token'
        }
    }
});
