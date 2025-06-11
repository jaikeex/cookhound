import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';

/**
 * Handles GET requests to `/api/revalidate` to revalidate a Next.js cache path.
 *
 * @param request - The incoming Next.js request object, which should contain a `path` query parameter.
 * @returns A JSON response indicating whether the revalidation was successful.
 */
export async function GET(request: NextRequest) {
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
}
