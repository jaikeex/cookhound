import { ENV_CONFIG_PRIVATE } from '@/common/constants';
import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';

/**
 * Handles GET requests to `/api/revalidate` to revalidate a Next.js cache path.
 * Requires a valid token in the query parameters.
 *
 * @param request - The incoming Next.js request object, which should contain a `path` query parameter.
 * @returns A JSON response indicating whether the revalidation was successful.
 */
export async function GET(request: NextRequest) {
    try {
        const token = request.nextUrl.searchParams.get('token');

        if (token !== ENV_CONFIG_PRIVATE.REVALIDATE_PATH_TOKEN) {
            return Response.json({
                revalidated: false,
                now: Date.now(),
                message: 'Invalid token'
            });
        }

        const path = request.nextUrl.searchParams.get('path');

        if (path) {
            revalidatePath(path);
            return Response.json({ revalidated: true, now: Date.now() });
        }

        return Response.json({
            revalidated: false,
            now: Date.now(),
            message: 'Missing path to revalidate'
        });
    } catch (error: unknown) {
        return Response.json({
            revalidated: false,
            now: Date.now(),
            message: 'Failed to revalidate path'
        });
    }
}
