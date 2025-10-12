import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { RequestContext } from '@/server/utils/reqwest/context';
import { logRequest, logResponse } from '@/server/logger/wrappers/logRequest';
import { handleServerError } from '@/server/utils/reqwest/handleApiError';

/**
 * Ensures that the supplied route handler executes inside a RequestContext.
 *
 * This wrapper should be the FIRST middleware in every route pipeline so that any subsequent middleware
 * can safely assume that the context is already initialised.
 * Also adds standard logging (request/response) and a top-level try/catch that turns
 * any thrown error into a app standardized format.
 */
export function withRequestContext<
    S extends unknown[],
    T extends (
        req: NextRequest,
        ...rest: S
    ) => Promise<NextResponse> | NextResponse
>(handler: T): T {
    const wrapped = async (
        ...args: Parameters<T>
    ): Promise<Awaited<ReturnType<T>>> => {
        const [req] = args as Parameters<T>;

        const execute = async (): Promise<Awaited<ReturnType<T>>> => {
            try {
                // Standard request logging
                await logRequest();

                // Execute the actual business handler
                const res = await (
                    handler as unknown as (...a: Parameters<T>) => ReturnType<T>
                )(...args);

                // Successful response logging
                if (res instanceof NextResponse) {
                    await logResponse(res);
                }

                return res as Awaited<ReturnType<T>>;
            } catch (error: unknown) {
                return handleServerError(error) as Awaited<ReturnType<T>>;
            }
        };

        // If a RequestContext is already active (nested wrapper), just delegate.
        if (RequestContext.getRequestId()) {
            return execute();
        }

        // Otherwise create a fresh context and execute.
        return RequestContext.run(req, execute) as Awaited<ReturnType<T>>;
    };

    return wrapped as unknown as T;
}
