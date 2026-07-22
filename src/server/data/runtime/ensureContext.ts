import 'server-only';
import { RequestContext } from '@/server/utils/reqwest/context';
import { runContextFromHeaders } from '@/server/utils/reqwest/context/httpContext';

/**
 * Run a function inside a RequestContext, building one from next/headers if none is active.
 *
 * Server-side data wrappers use this so services get a populated context
 * instead of the empty one they would see during an RSC render. Without it,
 * visibility groups and auth guards would not see the caller's identity.
 *
 * @param fn - The work to run within the render context.
 * @returns Whatever `fn` resolves to.
 */
export const ensureRenderContext = async <T>(
    fn: () => Promise<T>
): Promise<T> =>
    RequestContext.getRequestId() ? fn() : runContextFromHeaders(fn);
