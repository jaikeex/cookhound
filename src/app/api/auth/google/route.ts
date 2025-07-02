import type { NextRequest } from 'next/server';
import { authService } from '@/server/services/auth/service';
import { handleServerError, validatePayload } from '@/server/utils/reqwest';
import { AuthErrorForbidden } from '@/server/error';
import { logRequest, logResponse } from '@/server/logger';
import { RequestContext } from '@/server/utils/reqwest/context';
import { UserRole } from '@/common/types';
import z from 'zod';
import { ApplicationErrorCode } from '@/server/error/codes';
import { createSessionCookie } from '@/server/utils/session/cookie';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const GoogleAuthSchema = z.strictObject({
    code: z.string().trim()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

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

            const payload = validatePayload(GoogleAuthSchema, rawPayload);

            const user = await authService.loginWithGoogle({
                code: payload.code
            });

            const cookie = createSessionCookie(user.token, false);

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
