import type { I18nMessage } from '@/client/locales';
import {
    ApplicationErrorCode,
    type ServerErrorCode,
    type InfrastructureErrorCode
} from './codes';

export enum ServerErrorName {
    ServerError = 'ServerError',
    ClientError = 'ClientError',
    InfrastructureError = 'InfrastructureError',
    ValidationError = 'ValidationError',
    AuthErrorUnauthorized = 'AuthErrorUnauthorized',
    AuthErrorForbidden = 'AuthErrorForbidden',
    NotFoundError = 'NotFoundError',
    ConflictError = 'ConflictError',
    PayloadTooLargeError = 'PayloadTooLargeError'
}

const serverErrorNames = Object.values(ServerErrorName);

export function isServerError(error: unknown): error is ServerError {
    if (error instanceof ServerError) {
        return true;
    }

    if (typeof error === 'object' && error !== null && 'name' in error) {
        return serverErrorNames.includes(error.name as ServerErrorName);
    }

    return false;
}

/**
 * General wrapper for all 'checked' errors thrown from inside the service and db layers.
 *
 * It should be the primary type of error thrown on purpose, so that the type
 * can be checked against inside the route handlers, in order do discriminate
 * between known and unknown errors.
 */
export class ServerError extends Error {
    status: number;
    code: ServerErrorCode;
    // The original error (if any) that triggered this one.
    declare cause: unknown;

    constructor(
        message: I18nMessage,
        status: number,
        code: ServerErrorCode = ApplicationErrorCode.DEFAULT,
        cause?: unknown
    ) {
        super(message, cause ? { cause } : undefined);

        this.status = status;
        this.code = code;
        this.name = 'ServerError';
    }
}

//~=========================================================================================~//
//$                                     CLIENT-SIDE ERRORS                                  $//
//~=========================================================================================~//

/**
 * Base class for _expected_ client-side failures (4xx). Extends `ServerError` so existing
 * error-handling code continues to work unchanged. Each subclass hard-codes the correct
 * HTTP status so callers no longer have to remember numbers.
 */
export class ClientError extends ServerError {
    constructor(
        message: I18nMessage,
        status: number = 400,
        code: ApplicationErrorCode = ApplicationErrorCode.DEFAULT,
        cause?: unknown
    ) {
        super(message, status, code, cause);
        this.name = 'ClientError';
    }
}

/** 400 – Request failed validation. */
export class ValidationError extends ClientError {
    constructor(
        message: I18nMessage = 'app.error.bad-request',
        code: ApplicationErrorCode = ApplicationErrorCode.VALIDATION_FAILED,
        cause?: unknown
    ) {
        super(message, 400, code, cause);
        this.name = 'ValidationError';
    }
}

/** 401 – Authentication failure. */
export class AuthErrorUnauthorized extends ClientError {
    constructor(
        message: I18nMessage = 'auth.error.unauthorized',
        code: ApplicationErrorCode = ApplicationErrorCode.UNAUTHORIZED,
        cause?: unknown
    ) {
        // Some endpoints may want to return 403 instead of 401, allow override.
        super(message, 401, code, cause);
        this.name = 'AuthErrorUnauthorized';
    }
}

/** 403 – Authorisation failure. */
export class AuthErrorForbidden extends ClientError {
    constructor(
        message: I18nMessage = 'auth.error.forbidden',
        code: ApplicationErrorCode = ApplicationErrorCode.FORBIDDEN,
        cause?: unknown
    ) {
        super(message, 403, code, cause);
        this.name = 'AuthErrorForbidden';
    }
}

/** 404 – Resource not found. */
export class NotFoundError extends ClientError {
    constructor(
        message: I18nMessage = 'app.error.not-found',
        code: ApplicationErrorCode = ApplicationErrorCode.NOT_FOUND,
        cause?: unknown
    ) {
        super(message, 404, code, cause);
        this.name = 'NotFoundError';
    }
}

/** 409 – Conflict */
export class ConflictError extends ClientError {
    constructor(
        message: I18nMessage = 'app.error.conflict',
        code: ApplicationErrorCode = ApplicationErrorCode.CONFLICT,
        cause?: unknown
    ) {
        super(message, 409, code, cause);
        this.name = 'ConflictError';
    }
}

/** 413 – Payload Too Large */
export class PayloadTooLargeError extends ClientError {
    constructor(
        message: I18nMessage = 'app.error.payload-too-large',
        code: ApplicationErrorCode = ApplicationErrorCode.PAYLOAD_TOO_LARGE,
        cause?: unknown
    ) {
        super(message, 413, code, cause);
        this.name = 'PayloadTooLargeError';
    }
}

//~=========================================================================================~//
//$                             EXPECTED INFRASTRUCTURE ERRORS                              $//
//~=========================================================================================~//

/**
 * Wrapper around 5xx errors coming from downstream services (database, Typesense, etc.)
 * that are anticipated and handled differently from truly unknown exceptions.
 */
export class InfrastructureError extends ServerError {
    public readonly code: InfrastructureErrorCode;

    constructor(
        code: InfrastructureErrorCode,
        cause?: unknown,
        message: I18nMessage = 'app.error.infrastructure',
        status: number = 503
    ) {
        super(message, status, code, cause);
        this.name = 'InfrastructureError';
        this.code = code;
    }
}
