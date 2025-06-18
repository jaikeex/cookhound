import type { I18nMessage } from '@/client/locales';

/**
 * General wrapper for all 'checked' errors thrown from inside the service and db layers.
 *
 * It should be the primary type of error thrown on purpose, so that the type
 * can be checked against inside the route handlers, in order do discriminate
 * between known and unknown errors.
 */
export class ServerError extends Error {
    status: number;

    constructor(message: I18nMessage, status: number) {
        super(message);
        this.status = status;
        this.name = 'ServerError';
    }
}
