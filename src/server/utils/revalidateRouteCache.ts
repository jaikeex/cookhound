import {
    ENV_CONFIG_PRIVATE,
    ENV_CONFIG_PUBLIC,
    REVALIDATE_TOKEN_HEADER
} from '@/common/constants';
import { RequestContext } from '@/server/utils/reqwest/context';

/**
 * Revalidates the nextjs cache for a route.
 *
 * The revalidation mechanism depends on the execution origin (see {@link RequestContext}):
 *   (1) request/render: already inside a Next.js server runtime, so direct call is possible
 *   (2) worker (or unknown): jobs have no next runtime, so the op must go through the running
 *   next server over http and let the route do the auth and revalidation.
 *
 * @param path - The path of the route to revalidate.
 */
export const revalidateRouteCache = async (path: string) => {
    const origin = RequestContext.getOrigin();

    //|-----------------------------------------------------------------------------------------|//
    //?                                        IN-PROCESS                                       ?//
    //|-----------------------------------------------------------------------------------------|//

    if (origin === 'request' || origin === 'render') {
        // dynamic import on purpose: keeps next/cache out of the worker's module graph.
        const { revalidatePath } = await import('next/cache');
        revalidatePath(path);

        return { revalidated: true };
    }
    //|-----------------------------------------------------------------------------------------|//
    //?                                      OUT OF PROCESS                                     ?//
    //|-----------------------------------------------------------------------------------------|//

    // path is not secret and may stay in the query string; the token must not.
    const url = `${ENV_CONFIG_PUBLIC.ORIGIN}/api/revalidate?path=${encodeURIComponent(path)}`;

    const response = await fetch(url, {
        headers: {
            [REVALIDATE_TOKEN_HEADER]: ENV_CONFIG_PRIVATE.REVALIDATE_PATH_TOKEN
        }
    });

    return response.json();
};
