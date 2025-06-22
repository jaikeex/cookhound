import { UserRole } from '@/common/types';
import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';
import { deleteSession, parseSession } from '@/server/utils/session/cookie';

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
    userRole?: UserRole | null;
    userId?: number | null;
    ip?: string;
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
            ctx.ip =
                req?.headers?.get('x-forwarded-for') ||
                req?.headers?.get('x-real-ip') ||
                undefined;

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
            ///                                     SESSION                                     ///
            ///---------------------------------------------------------------------------------///

            const tokenPayload = await parseSession();

            if (tokenPayload) {
                ctx.userId = Number(tokenPayload.id);
                ctx.userRole = tokenPayload.role;
            } else {
                deleteSession();
                ctx.userRole = UserRole.Guest;
            }
        } catch {
            /**
             * DO NOTHING HERE
             * Under no circumstances can an error here fail the entire request. It should simply continue
             * with the values that did not fail, or empty if none of them were set. That is not
             * a big isssue, services should still do all the needed checks themselves where appropriate.
             */
        }

        // The AsyncLocalStorage instance takes care of propagating the store
        // across every async boundary that happens while `fn` is running.
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
            (store as any)[key] = value;
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
