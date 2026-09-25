import { isI18nMessage, type I18nMessage } from '@/client/locales';

export const CLIENT_ERROR_CODE = {
    NETWORK: 'NETWORK_ERROR',
    UNKNOWN: 'unknown'
} as const;

const STATUS_FALLBACK_MESSAGE: Readonly<Partial<Record<number, I18nMessage>>> =
    {
        400: 'app.error.bad-request',
        401: 'auth.error.unauthorized',
        403: 'auth.error.forbidden',
        404: 'app.error.not-found',
        409: 'app.error.conflict',
        413: 'app.error.payload-too-large',
        415: 'app.error.unsupported-media-type',
        429: 'app.error.too-many-requests',
        502: 'app.error.infrastructure',
        503: 'app.error.infrastructure',
        504: 'app.error.infrastructure'
    };

/**
 * The single error type the client transport throws.
 * message is always a known translation key, so it is safe
 * to pass to t(); status is 0 when no response was received at all.
 */
export class RequestError extends Error {
    override name = 'RequestError';

    constructor(
        public message: I18nMessage,
        public status: number,
        public code: string,
        public requestId: string,
        public timestamp: string,
        public title: string,
        cause?: unknown
    ) {
        super(message, cause === undefined ? undefined : { cause });
    }

    /**
     * Builds the error for a non-2xx response.
     */
    static fromResponse(body: unknown, response: Response): RequestError {
        const payload: Partial<ErrorResponse> =
            typeof body === 'object' && body !== null ? body : {};

        const message = isI18nMessage(payload.message)
            ? payload.message
            : (STATUS_FALLBACK_MESSAGE[response.status] ?? 'app.error.default');

        return new RequestError(
            message,
            response.status,
            payload.code || CLIENT_ERROR_CODE.UNKNOWN,
            payload.requestId || 'unknown',
            payload.timestamp || new Date().toISOString(),
            payload.title || 'unknown'
        );
    }

    /**
     * Builds the error for a request that never got a response.
     */
    static network(cause: unknown): RequestError {
        return new RequestError(
            'app.error.network',
            0,
            CLIENT_ERROR_CODE.NETWORK,
            'unknown',
            new Date().toISOString(),
            'network',
            cause
        );
    }
}
