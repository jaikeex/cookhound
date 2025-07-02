import type { NextRequest } from 'next/server';
import { authService } from '@/server/services/auth/service';
import { AuthErrorForbidden } from '@/server/error';
import { logRequest, logResponse } from '@/server/logger';
import { RequestContext } from '@/server/utils/reqwest/context';
import { handleServerError, validatePayload } from '@/server/utils/reqwest';
import { UserRole } from '@/common/types';
import z from 'zod';
import { ApplicationErrorCode } from '@/server/error/codes';
import { createSessionCookie } from '@/server/utils/session/cookie';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().trim().min(1).max(40), // Don't validate password strength on login
    keepLoggedIn: z.boolean().optional()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
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

            // Check if the user is already logged in.
            if (RequestContext.getUserRole() !== UserRole.Guest) {
                throw new AuthErrorForbidden(
                    'auth.error.user-already-logged-in',
                    ApplicationErrorCode.ALREADY_LOGGED_IN
                );
            }

            const rawPayload = await request.json();

            const payload = validatePayload(LoginSchema, rawPayload);

            const user = await authService.login({
                email: payload.email,
                password: payload.password,
                keepLoggedIn: payload.keepLoggedIn ?? false
            });

            const cookie = createSessionCookie(
                user.token,
                payload.keepLoggedIn ?? false
            );

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
        } catch (error: unknown) {
            return handleServerError(error);
        }
    });
}
