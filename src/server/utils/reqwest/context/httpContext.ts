import 'server-only';

import { UserRole } from '@/common/types';
import { randomUUID } from 'crypto';
import { cookies, headers } from 'next/headers';
import { sessions } from '@/server/utils/session/manager';
import { SESSION_COOKIE_NAME } from '@/common/constants/general';
import {
    runWithContext,
    type ExecutionOrigin,
    type RequestContextShape
} from './store';

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                   HTTP CONTEXT CONSTRUCTION                                 ?//
///
//# The next-only half of the request context. It reads the nextjs request runtime
//# (next/headers) to build a context.
//#
//# The "import 'server-only'" is intentional and plays a big role. This module
//# must never be called from the worker, and because the worker does not run nextjs,
//# that import cant be resolved and the app throws. It is also an elegant way to guard
//# against any future refactor that accidentally pulls this into any non-next environment.
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                    WHEN A CONTEXT IS ACTIVE                                 ?//
///
//# A live http request existing is not the same thing as one of these context scopes being active.
//#
//# This AsyncLocalStorage scope is opt-in and is opened in exactly two places:
//#   (1) API routes, where the withRequestContext pipe calls runRequestContext(req, …)
//#   (2) Server Component renders explicitly wrapped in ensureRenderContext - either a
//#       single serverData read, or a whole page body when it has several of them.
//#
//# Next.js has nothing to do with this, any call outside those two paths runs with no
//# scope, so its getters return null and the logger labels the line [server].
//#
//# Many render time reads are left unwrapped on purpose. Building a context here calls
//# cookies()/headers(), which puts a route out of static generation.
//# Any read that does not care about user identity should deliberately skip the wrapper to keep
//# their pages ISR eligible and to avoid a pointless Redis session lookup.
//#
//# This has one important consequence: inside a [server] call, getUserId()/getUserRole()
//# see null / guest. That is correct for public reads. Wrap a read in ensureRenderContext
//# whenever the render genuinely needs the caller's identity (auth guards, visibility groups...).
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

interface HeaderReader {
    get(name: string): string | null;
}

/**
 * Minimal source the context builder needs.
 */
interface ContextSource {
    method: string;
    url?: string;
    headers: HeaderReader;
}

async function buildContext(
    source: ContextSource,
    origin: ExecutionOrigin
): Promise<RequestContextShape> {
    const ctx: RequestContextShape = {} as RequestContextShape;

    try {
        ///---------------------------------------------------------------------------------///
        ///                                  IP AND METHOD                                  ///
        ///---------------------------------------------------------------------------------///

        ctx.requestId = randomUUID();
        ctx.origin = origin;
        ctx.requestMethod = source.method;

        // Do not read these from the session when setting the context up.
        ctx.userAgent = source.headers.get('user-agent') || null;
        ctx.ip =
            source.headers.get('x-forwarded-for') ||
            source.headers.get('x-real-ip') ||
            null;

        ///---------------------------------------------------------------------------------///
        ///                                     PATH                                        ///
        ///---------------------------------------------------------------------------------///

        if (source.url) {
            try {
                const url = new URL(source.url);
                ctx.requestPath = url.pathname + url.search;
            } catch {
                // If the URL parsing fails, provide a placeholder, do nothing more.
                ctx.requestPath = 'PATH UNKNOWN';
            }
        }

        ///---------------------------------------------------------------------------------///
        ///                                     COOKIES                                     ///
        ///---------------------------------------------------------------------------------///

        const cookieStore = await cookies();

        ///---------------------------------------------------------------------------------///
        ///                                     SESSION                                     ///
        ///---------------------------------------------------------------------------------///

        const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;

        if (session) {
            const serverSession = await sessions.validateSession(session);

            if (serverSession) {
                ctx.userId = serverSession.userId;
                ctx.userRole = serverSession.userRole;
                ctx.sessionId = serverSession.sessionId;
            } else {
                ctx.userRole = UserRole.Guest;
            }
        } else {
            ctx.userRole = UserRole.Guest;
        }
    } catch {
        /**
         *!DO NOTHING HERE
         * Under no circumstances can an error here fail the entire request. It should simply continue
         * with the values that did not fail, or empty if none of them were set. That is not
         * a big isssue, services should still do all the needed checks themselves where appropriate.
         */
    }

    return ctx;
}

/**
 * Start a fresh context for an API route handler and execute the provided
 * function within it. Side effects (cookie mutation, etc.) are allowed.
 *
 * @param req - The incoming request to derive the context from.
 * @param fn - The work to run within the freshly built context.
 */
export async function runRequestContext<T>(
    req: Request,
    fn: () => T
): Promise<T> {
    const ctx = await buildContext(
        {
            method: req.method,
            url: req.url,
            headers: req.headers
        },
        'request'
    );

    return runWithContext(ctx, fn);
}

/**
 * Start a fresh context from next/headers and execute the provided function within it.
 *
 * Reads request data from next/headers, so it can be called from any
 * server execution that lacks a Request object but still needs a context.
 *
 * @param fn - The work to run within the freshly built context.
 */
export async function runContextFromHeaders<T>(fn: () => T): Promise<T> {
    let headerList: HeaderReader;

    try {
        headerList = await headers();
    } catch {
        // If headers() is somehow unavailable, fall back to an empty reader
        // so context creation still proceeds (cookies are read separately).
        headerList = { get: () => null };
    }

    const ctx = await buildContext(
        {
            method: 'GET',
            headers: headerList
        },
        'render'
    );

    return runWithContext(ctx, fn);
}
