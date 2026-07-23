import { NextResponse, type NextRequest } from 'next/server';
import { MiddlewareError } from '@/server/error';
import {
    LEGACY_DISPLAY_ID_REGEX,
    RECIPE_DISPLAY_ID_REGEX
} from '@/common/constants/recipe';

//~=============================================================================================~//
//$                                       HELPER FUNCTIONS                                      $//
//~=============================================================================================~//

// Rewrite target that matches no app route
const NOT_FOUND_REWRITE_PATH = '/__proxy-404__';
const RECIPE_SEGMENT = 'recept';

function rejectAsNotFound(request: NextRequest): never {
    const url = request.nextUrl.clone();

    url.pathname = NOT_FOUND_REWRITE_PATH;
    url.search = '';

    throw new MiddlewareError(
        'Malformed recipe path',
        NextResponse.rewrite(url)
    );
}

//~=============================================================================================~//
//$                                     PROXY STEP FUNCTION                                     $//
//~=============================================================================================~//

/**
 * Rejects wrong /recept/<param> paths with a real 404 before any rendering starts.
 *
 * The problem this solves is this:
 * The recipe detail route has a loading.tsx, which makes it a streamed route.
 * Next flushes the shell and loading skeleton with a 200 status before the page component
 * even gets a chance to run. By the time a notFound() is called, the ok status is already
 * returned, and the client gets the not-found boundary rendered inside a 200 response.
 * Middleware is pretty much the only place in this architecture where the status can
 * still be decided, which is why this step fn exists.
 *
 *!This is a middleware function. It should not be called from any other context.
 *
 * @param request - The request object.
 *
 * @throws MiddlewareError (404 rewrite) if the recipe path is malformed.
 * @returns null if the path is not a recipe path or is fine.
 */
export const verifyRecipePathFormat: MiddlewareStepFunction = async (
    request
) => {
    const segments = request.nextUrl.pathname.split('/').filter(Boolean);

    if (segments[0] !== RECIPE_SEGMENT) {
        return null;
    }

    // bare /recept matches no route, next answers with a "native" 404.
    if (segments.length === 1) {
        return null;
    }

    // the proxy sees the raw path before routing, so the static sibling
    // /recept/create must be allowed explicitly; /recept/create/<anything>
    // would land in [displayId]='create' and must 404 instead.
    if (segments[1] === 'create') {
        return segments.length === 2 ? null : rejectAsNotFound(request);
    }

    // a malformed percent-escape can never name a recipe, 404 it too.
    let displayId: string;

    try {
        displayId = decodeURIComponent(segments[1]);
    } catch {
        rejectAsNotFound(request);
    }

    if (RECIPE_DISPLAY_ID_REGEX.test(displayId)) {
        return null;
    }

    if (LEGACY_DISPLAY_ID_REGEX.test(displayId)) {
        return null;
    }

    rejectAsNotFound(request);
};
