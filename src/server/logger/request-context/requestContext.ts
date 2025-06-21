import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

export const REQUEST_ID_FIELD_NAME = 'requestId';
export const REQUEST_PATH_FIELD_NAME = 'path';

/**
 * Shape of data carried inside the async context during the lifetime of a single request.
 * Extend this interface with more optional properties as required.
 */
export interface RequestContextShape {
    [REQUEST_ID_FIELD_NAME]: string;
    [REQUEST_PATH_FIELD_NAME]?: string;
    ip?: string;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContextShape>();

export const RequestContext = {
    /**
     * Start a fresh context for the current request and execute the provided
     * function within that context.
     */
    run<T>(req: Request, fn: () => T): T {
        const ctx: RequestContextShape = {
            [REQUEST_ID_FIELD_NAME]: randomUUID(),
            ip:
                req?.headers?.get('x-forwarded-for') ||
                req?.headers?.get('x-real-ip') ||
                undefined
        };

        try {
            const url = new URL(req.url);
            const requestPath = url.pathname + url.search;

            ctx[REQUEST_PATH_FIELD_NAME] = requestPath;
        } catch {
            // If the URL parsing fails, provide a placeholder, do nothing more.
            ctx[REQUEST_PATH_FIELD_NAME] = 'PATH UNKNOWN';
        }

        // The AsyncLocalStorage instance takes care of propagating the store
        // across every async boundary that happens while `fn` is running.
        return asyncLocalStorage.run(ctx, fn);
    },

    get<K extends keyof RequestContextShape>(
        key: K
    ): RequestContextShape[K] | undefined {
        return asyncLocalStorage.getStore()?.[key];
    },

    set<K extends keyof RequestContextShape>(
        key: K,
        value: RequestContextShape[K]
    ): void {
        const store = asyncLocalStorage.getStore();
        if (store) {
            (store as any)[key] = value;
        }
    }
};
