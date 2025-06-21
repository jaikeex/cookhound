import type { NextRequest } from 'next/server';
import { authService } from '@/server/services/auth/service';
import { serialize } from 'cookie';
import { handleServerError, verifyIsGuest } from '@/server/utils';
import { ENV_CONFIG_PUBLIC } from '@/common/constants/env';
import { ServerError } from '@/server/error';
import { logRequest, logResponse, RequestContext } from '@/server/logger';

//|=============================================================================================|//

/**
 * Handles POST requests to `/auth/login` to authenticate a user with email and password.
 *
 * ! This endpoint is restricted and only accessible to guests.
 *
 * @param request - The incoming Next.js request object containing the user's email,
 *                  password, and keepLoggedIn flag.
 * @returns A JSON response with the user object on success, or an error response on failure.
 *
 * - 200: Success, with user object.
 * - 400: Bad Request, if the email, password, or keepLoggedIn flag is missing.
 * - 401: Unauthorized, if the email or password is invalid.
 * - 403: Forbidden, if the user's email is not verified.
 * - 500: Internal Server Error, if there is another error during authentication.
 */
export async function POST(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const { email, password, keepLoggedIn } = await request.json();

            // Check if the user is already logged in.
            if (!(await verifyIsGuest())) {
                throw new ServerError('auth.error.user-already-logged-in', 400);
            }

            const user = await authService.login({
                email,
                password,
                keepLoggedIn
            });

            const cookie = serialize('jwt', user.token, {
                httpOnly: true,
                secure: ENV_CONFIG_PUBLIC.ENV !== 'development',
                sameSite: 'strict',
                maxAge: keepLoggedIn ? 60 * 60 * 24 * 30 : undefined,
                path: '/'
            });

            const response = Response.json(
                { ...user.user },
                {
                    headers: {
                        'Set-Cookie': cookie
                    }
                }
            );

            logResponse(response);
            return response;
        } catch (error: any) {
            return handleServerError(error);
        }
    });
}
