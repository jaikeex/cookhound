import { ServerError } from '@/server/error/server';
import * as Sentry from '@sentry/nextjs';

/**
 * Performs all necessary operations in order to return an error to the client that
 * is immediately usable without further checks.
 *
 * It is intended to be called as the final catch in the request path and returned as is.
 *
 * @param error the error object to be handled
 * @returns 'sanitized' response object with message and status
 */
export function handleServerError(error: any) {
    if (error instanceof ServerError) {
        return Response.json(
            { message: error.message },
            { status: error.status }
        );
    }

    /**
     * If the error is NOT a ServerError, something non-expected happened.
     * Do not send the error details to the client, instead log/sentry them
     * in order to be ignored for ages and finally never fixed.
     */
    Sentry.captureException(error);
    return Response.json({ message: 'app.error.default' }, { status: 500 });
}
