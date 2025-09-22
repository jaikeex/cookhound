import { isServerError } from '@/server/error';
import { logErrorResponse, Logger } from '@/server/logger';
import { RequestContext } from './context';
import { ApplicationErrorCode } from '@/server/error/codes';
import { NextResponse } from 'next/server';

const log = Logger.getInstance('api');

/**
 * Performs all necessary operations in order to return an error to the client that
 * is immediately usable without further checks.
 *
 * It is intended to be called as the final catch in the request path and returned as is.
 *
 * @param error the error object to be handled
 * @returns 'sanitized' response object with message, status and other metadata.
 */
export function handleServerError(error: unknown): NextResponse<ErrorResponse> {
    const requestId = RequestContext.getRequestId() ?? 'unknown';

    /**
     * This here is something called RFC-7807 “Problem Details” style JSON.
     * Well, the type field is missing and some are named differently but it is
     * close enough. Google for more info.
     */
    const response: ErrorResponse = {
        title: 'error',
        message: 'app.error.default',
        status: 500,
        code: ApplicationErrorCode.DEFAULT,
        requestId,
        timestamp: new Date().toISOString()
    };

    switch (true) {
        case isServerError(error): {
            response.message = error.message;
            response.status = error.status;
            response.code = error.code;
            break;
        }

        //?—————————————————————————————————————————————————————————————————————————————————————?//
        //?                                   Error: aborted                                    ?//
        ///
        //# Node occasionally throws an uncatchable "Error: aborted" when the client disconnects
        //# before the request has finished being parsed. This has no real consequence and
        //# the request causing this is 99% either DO healthchecks or something similar.
        //# (https://github.com/nodejs/node/blob/v20.x/lib/internal/http_server.js)
        ///
        //?—————————————————————————————————————————————————————————————————————————————————————?//

        case error instanceof Error && error.message === 'aborted': {
            response.message = 'app.error.client-aborted';
            // 499 is non-standard but widely used to signal that the client
            // dropped the connection. Next.js will happily accept it.
            response.status = 499;
            response.code = ApplicationErrorCode.DEFAULT;

            log.trace;

            // No need to log this anywhere.
            return NextResponse.json(response, { status: response.status });
        }

        default:
            log.errorWithStack('unchecked server error', error);
    }

    logErrorResponse(response);

    return NextResponse.json(response, { status: response.status });
}
