import { ValidationError } from '@/server/error';
import { Logger } from '@/server/logger';
import type { z } from 'zod';
import { ApplicationErrorCode } from '@/server/error/codes';

const log = Logger.getInstance('api');

//|---------------------------------------------------------------------------------------------|//
//?                                        SEARCH PARAMS                                        ?//
//|---------------------------------------------------------------------------------------------|//

/**
 * Converts the `URLSearchParams` instance into a plain object so that it can
 * be passed to zod for validation.
 */
function searchParamsToObject(
    searchParams: URLSearchParams
): Record<string, unknown> {
    const obj: Record<string, unknown> = {};

    searchParams.forEach((value, key) => {
        if (obj[key] === undefined) {
            obj[key] = value;
        } else if (Array.isArray(obj[key])) {
            (obj[key] as string[]).push(value);
        } else {
            obj[key] = [obj[key] as string, value];
        }
    });

    return obj;
}

/**
 * Validates query-string parameters against a zod schema.
 */
export function validateQuery<T>(schema: z.ZodType<T>, url: URL): T {
    const queryObject = searchParamsToObject(url.searchParams);
    const result = schema.safeParse(queryObject);

    if (!result.success) {
        const errorDetails = result.error.issues
            .map((err) => `${err.path.join('.')}: ${err.message}`)
            .join(', ');

        log.warn('Query parameter validation failed', {
            query: queryObject,
            schema: schema.description,
            validationErrors: errorDetails
        });

        throw new ValidationError(
            undefined,
            ApplicationErrorCode.VALIDATION_FAILED
        );
    }

    return result.data;
}

//|---------------------------------------------------------------------------------------------|//
//?                                           HEADERS                                           ?//
//|---------------------------------------------------------------------------------------------|//

/**
 * Normalises request headers for validation.
 */
function headersToObject(headers: Headers): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    headers.forEach((value, key) => {
        obj[key.toLowerCase()] = value;
    });
    return obj;
}

/**
 * Validates request headers against a zod schema.
 */
export function validateHeaders<T>(schema: z.ZodType<T>, headers: Headers): T {
    const headersObject = headersToObject(headers);
    const result = schema.safeParse(headersObject);

    if (!result.success) {
        const errorDetails = result.error.issues
            .map((err) => `${err.path.join('.')}: ${err.message}`)
            .join(', ');

        log.warn('Header validation failed', {
            headers: headersObject,
            schema: schema.description,
            validationErrors: errorDetails
        });

        throw new ValidationError(
            undefined,
            ApplicationErrorCode.VALIDATION_FAILED
        );
    }

    return result.data;
}

//|---------------------------------------------------------------------------------------------|//
//?                                          URL PARAMS                                         ?//
//|---------------------------------------------------------------------------------------------|//

/**
 * Validates URL/path parameters against a zod schema.
 */
export function validateParams<T>(
    schema: z.ZodType<T>,
    params: Record<string, unknown>
): T {
    const result = schema.safeParse(params);

    if (!result.success) {
        const errorDetails = result.error.issues
            .map((err) => `${err.path.join('.')}: ${err.message}`)
            .join(', ');

        log.warn('Path parameter validation failed', {
            params,
            schema: schema.description,
            validationErrors: errorDetails
        });

        throw new ValidationError(
            undefined,
            ApplicationErrorCode.VALIDATION_FAILED
        );
    }

    return result.data;
}

//|---------------------------------------------------------------------------------------------|//
//?                                           PAYLOAD                                           ?//
//|---------------------------------------------------------------------------------------------|//

/**
 * Validates request payload against a zod schema.
 */
export function validatePayload<T>(schema: z.ZodType<T>, payload: any): T {
    const validationResult = schema.safeParse(payload);

    if (!validationResult.success) {
        const errorDetails = validationResult.error.issues
            .map((err) => `${err.path.join('.')}: ${err.message}`)
            .join(', ');

        log.warn('Request payload validation failed', {
            payload,
            schema: schema.description,
            validationErrors: errorDetails
        });

        throw new ValidationError(
            undefined,
            ApplicationErrorCode.VALIDATION_FAILED
        );
    }

    return validationResult.data;
}
