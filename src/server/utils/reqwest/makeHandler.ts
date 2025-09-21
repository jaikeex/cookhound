import type { NextRequest, NextResponse } from 'next/server';
import { pipe } from './pipes/handler-pipe';
import { withRequestContext } from './pipes/with-request-context';
import { withOriginGuard } from './pipes/with-origin-guard';
import type { Middleware } from './pipes/handler-pipe';

/**
 * Factory for building Cookhound route handlers.
 *
 * Ensures that withRequestContext is applied as the outermost middleware so every subsequent
 * middleware and the handler itself run inside the RequestContext and gets automatic logging & error conversion.
 * Additional middlewares can be supplied and will be applied after the request context is set up.
 */
export function makeHandler<
    S extends unknown[],
    T extends (
        req: NextRequest,
        ...rest: S
    ) => Promise<NextResponse> | NextResponse
>(handler: T, ...middlewares: Middleware[]): T {
    //?—————————————————————————————————————————————————————————————————————————————————————————?//
    //?                                     GENERIC CAST                                        ?//
    ///
    //# The composed middlewares preserve the original handler signature, but TypeScript
    //# (for some reason, i have to study this later...) cannot infer that automatically.
    //# Therefore the cast of the final result back to T happens here, which is safe as the
    //# runtime wrapper simply forwards the call and returns the handler's response.
    ///
    //?—————————————————————————————————————————————————————————————————————————————————————————?//

    return pipe(
        withRequestContext,
        withOriginGuard,
        ...middlewares
    )(handler) as unknown as T;
}
