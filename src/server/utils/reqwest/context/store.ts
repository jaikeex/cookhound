import type { UserRole } from '@/common/types';
import { AsyncLocalStorage } from 'async_hooks';
import { setLoggerContextReader } from '@/server/logger/context-reader';

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                   AMBIENT CONTEXT STORE                                     ?//
///
//# The runtime agnostic half of the request context: the AsyncLocalStorage store plus the typed
//# getters/setters that read it. This module has no dependency on the nextjs request runtime,
//# so it is safe to import anywhere on the server.
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

export const REQUEST_ID_FIELD_NAME = 'requestId';
export const REQUEST_PATH_FIELD_NAME = 'path';

export type ExecutionOrigin = 'request' | 'render' | 'worker';

/**
 * Shape of data carried inside the async context during the lifetime of a single request.
 * Extend this interface with more optional properties as required.
 */
export interface RequestContextShape {
    requestId: string;
    origin?: ExecutionOrigin;
    requestPath?: string;
    requestMethod?: string;
    sessionId?: string | null;
    userRole?: UserRole | null;
    userId?: number | null;
    userAgent?: string | null;
    ip?: string | null;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContextShape>();

/**
 * Activate a pre-built context for the duration of fn.
 *
 * The low-level primitive the HTTP-edge builders in ./httpContext use to run work
 * inside a context they have constructed. The AsyncLocalStorage instance propagates
 * the store across every async boundary that happens while `fn` is running.
 *
 * @param ctx - The context to make active.
 * @param fn - The work to run within it.
 * @returns Whatever `fn` returns.
 */
export function runWithContext<T>(ctx: RequestContextShape, fn: () => T): T {
    return asyncLocalStorage.run(ctx, fn);
}

export const RequestContext = {
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

    getOrigin(): ExecutionOrigin | null {
        return this.get('origin') ?? null;
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
