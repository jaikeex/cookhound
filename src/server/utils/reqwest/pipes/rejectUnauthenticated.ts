import type { NextResponse } from 'next/server';
import { AuthErrorUnauthorized } from '@/server/error';
import { handleServerError } from '@/server/utils/reqwest/handleApiError';
import { deleteSessionCookie } from '@/server/utils/session';

/**
 * Rejects an unauthenticated request and tears down any stale session cookie.
 *
 * This is the single place where the auth pipes (withAuth / withAdmin) turn an
 * unauthenticated request away. It runs inside a route handler (cookie mutation
 * is legal here), so it can delete the httpOnly session cookie that only a
 * server response is able to clear.
 *
 * The delete is awaited so the resulting Set-Cookie header is attached to the
 * 401 response before it is returned. Deleting an absent cookie is a harmless
 * no-op, so this is safe to call for fully anonymous requests too.
 */
export async function rejectUnauthenticated(): Promise<
    NextResponse<ErrorResponse>
> {
    await deleteSessionCookie();

    return handleServerError(new AuthErrorUnauthorized());
}
