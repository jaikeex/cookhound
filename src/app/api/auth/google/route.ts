import type { NextRequest } from 'next/server';
import { authService } from '@/server/services/auth/service';
import { serialize } from 'cookie';
import { handleServerError, verifyIsGuest } from '@/server/utils';
import { ServerError } from '@/server/error';

/**
 * Handles POST requests to `/auth/google` to authenticate a user using Google OAuth.
 *
 * ! This endpoint is restricted and only accessible to guests.
 *
 * @param request - The incoming Next.js request object containing the Google OAuth code.
 * @returns A JSON response with the user object on success, or an error
 * response on failure.
 *
 * - 200: Success, with user object.
 * - 400: Bad Request, if the Google OAuth code is missing.
 * - 401: Unauthorized, if the Google OAuth code is invalid or the access
 *        token is missing or the user info is missing.
 * - 500: Internal Server Error, if there is an error during authentication.
 */
export async function POST(request: NextRequest) {
    try {
        // Check if the user is already logged in.
        if (!(await verifyIsGuest())) {
            throw new ServerError('auth.error.user-already-logged-in', 400);
        }

        const { code } = await request.json();

        const response = await authService.loginWithGoogleOauth({ code });

        const cookie = serialize('jwt', response.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 30,
            path: '/'
        });

        return Response.json(
            { ...response.user },
            {
                headers: {
                    'Set-Cookie': cookie
                }
            }
        );
    } catch (error: any) {
        return handleServerError(error);
    }
}
