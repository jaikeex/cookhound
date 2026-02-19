import { UserRole } from '@/common/types';
import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import { sessions } from '@/server/utils/session/manager';
import { setLoggerContextReader } from '@/server/logger/context-reader';
import {
    DEFAULT_LOCALE,
    SESSION_COOKIE_NAME
} from '@/common/constants/general';
import type { Locale } from '@/common/types';
import { getUserLocale } from '@/common/utils';

export const REQUEST_ID_FIELD_NAME = 'requestId';
export const REQUEST_PATH_FIELD_NAME = 'path';

/**
 * Shape of data carried inside the async context during the lifetime of a single request.
 * Extend this interface with more optional properties as required.
 */
export interface RequestContextShape {
    requestId: string;
    requestPath?: string;
    requestMethod?: string;
    sessionId?: string | null;
    userRole?: UserRole | null;
    userLocale?: Locale | null;
    userId?: number | null;
    userAgent?: string | null;
    ip?: string | null;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContextShape>();

export const RequestContext = {
    //~-----------------------------------------------------------------------------------------~//
    //$                                      INITIALIZATION                                     $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Start a fresh context for the current request and execute the provided
     * function within that context.
     *
     * § The initialization of the context values can absolutely never throw an error.
     * § Leave the context blank if something goes wrong. The services will know what to do.
     */
    async run<T>(req: Request, fn: () => T): Promise<T> {
        const ctx: RequestContextShape = {} as RequestContextShape;

        try {
            ///---------------------------------------------------------------------------------///
            ///                                  IP AND METHOD                                  ///
            ///---------------------------------------------------------------------------------///

            ctx.requestId = randomUUID();
            ctx.requestMethod = req.method;

            // Do not read these from the session when setting the context up.
            ctx.userAgent = req.headers.get('user-agent') || null;
            ctx.ip =
                req?.headers?.get('x-forwarded-for') ||
                req?.headers?.get('x-real-ip') ||
                null;

            ///---------------------------------------------------------------------------------///
            ///                                     PATH                                        ///
            ///---------------------------------------------------------------------------------///

            try {
                const url = new URL(req.url);
                const requestPath = url.pathname + url.search;

                ctx.requestPath = requestPath;
            } catch {
                // If the URL parsing fails, provide a placeholder, do nothing more.
                ctx.requestPath = 'PATH UNKNOWN';
            }
            ///---------------------------------------------------------------------------------///
            ///                                     LOCALE                                      ///
            ///---------------------------------------------------------------------------------///

            try {
                const cookieStore = await cookies();

                const locale = await getUserLocale(cookieStore, req.headers);
                ctx.userLocale = locale;
            } catch {
                // If the locale fetching fails, provide a placeholder, do nothing more.
                ctx.userLocale = DEFAULT_LOCALE;
            }

            ///---------------------------------------------------------------------------------///
            ///                                     SESSION                                     ///
            ///---------------------------------------------------------------------------------///

            const session = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

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

        // The AsyncLocalStorage instance takes care of propagating the store
        // across every async boundary that happens while 'fn' is running.
        return asyncLocalStorage.run(ctx, fn);
    },

    //~-----------------------------------------------------------------------------------------~//
    //$                                         GETTERS                                         $//
    //~-----------------------------------------------------------------------------------------~//

    get<K extends keyof RequestContextShape>(
        key: K
    ): RequestContextShape[K] | undefined {
        return asyncLocalStorage.getStore()?.[key];
    },

    getRequestId(): string | null {
        return this.get('requestId') ?? null;
    },

    getRequestPath(): string | undefined {
        return this.get('requestPath') ?? undefined;
    },

    getRequestMethod(): string | undefined {
        return this.get('requestMethod') ?? undefined;
    },

    getUserAgent(): string | null {
        return this.get('userAgent') ?? null;
    },

    getSessionId(): string | null {
        return this.get('sessionId') ?? null;
    },

    getUserRole(): UserRole | null {
        return this.get('userRole') ?? null;
    },

    getUserId(): number | null {
        return this.get('userId') ?? null;
    },

    getUserLocale(): Locale | null {
        return (this.get('userLocale') as Locale | null) ?? null;
    },

    getIp(): string | null {
        return this.get('ip') ?? null;
    },

    //~-----------------------------------------------------------------------------------------~//
    //$                                         SETTERS                                         $//
    //~-----------------------------------------------------------------------------------------~//

    set<K extends keyof RequestContextShape>(
        key: K,
        value: RequestContextShape[K]
    ): void {
        const store = asyncLocalStorage.getStore();
        if (store) {
            (store as RequestContextShape)[key] = value;
        }
    },

    setRequestId(value: string) {
        this.set('requestId', value);
    },

    setRequestPath(value: string) {
        this.set('requestPath', value);
    },

    setRequestMethod(value: string) {
        this.set('requestMethod', value);
    },

    setUserAgent(value: string) {
        this.set('userAgent', value);
    },

    setSessionId(value: string) {
        this.set('sessionId', value);
    },

    setUserRole(value: UserRole) {
        this.set('userRole', value);
    },

    setUserId(value: number) {
        this.set('userId', value);
    },

    setIp(value: string) {
        this.set('ip', value);
    }
};

//! Do not remove this
//? See logger for more details
setLoggerContextReader(RequestContext);
