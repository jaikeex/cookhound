import { NextResponse } from 'next/server';
import { handleServerError } from './handleApiError';

/**
 * Returns a 200 JSON response.
 */
export function ok<T>(data: T, init?: ResponseInit): NextResponse<T> {
    return NextResponse.json(data, {
        status: 200,
        ...init
    });
}

/**
 * Returns a 201 JSON response.
 */
export function created<T>(data: T, init?: ResponseInit): NextResponse<T> {
    return NextResponse.json(data, {
        status: 201,
        ...init
    });
}

/**
 * Returns a 204 empty Response.
 */
export function noContent(init?: ResponseInit): NextResponse<null> {
    return new NextResponse(null, { status: 204, ...init });
}

// Reexported for convenience
export const err = handleServerError;
