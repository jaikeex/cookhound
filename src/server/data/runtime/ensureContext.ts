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
 * A page may also wrap its whole body in this when several context-bound reads
 * run in one render. The short-circuit below only sees a context that is
 * already active around the caller, so parallel top-level reads each build
 * their own - and each pays a session validation. Hoisting one context to the
 * page turns every nested call into a no-op and resolves the session once.
 * Only worth doing on a route that is dynamic anyway; see the note in
 * httpContext about building a context costing static generation.
 *
 * @param fn - The work to run within the render context.
 * @returns Whatever `fn` resolves to.
 */
export const ensureRenderContext = async <T>(
    fn: () => Promise<T>
): Promise<T> =>
    RequestContext.getRequestId() ? fn() : runContextFromHeaders(fn);
