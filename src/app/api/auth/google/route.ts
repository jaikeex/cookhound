import type { NextRequest } from 'next/server';
import { authService } from '@/server/services/auth/service';
import { makeHandler, readJson, validatePayload } from '@/server/utils/reqwest';
import { AuthErrorForbidden } from '@/server/error';
import { z } from 'zod';
import { ApplicationErrorCode } from '@/server/error/codes';
import { createSessionCookie } from '@/server/utils/session/cookie';
import { assertAnonymous, ok } from '@/server/utils/reqwest';

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
async function postHandler(request: NextRequest) {
    assertAnonymous(
        new AuthErrorForbidden(
            'auth.error.user-already-logged-in',
            ApplicationErrorCode.ALREADY_LOGGED_IN
        )
    );

    const rawPayload = await readJson(request);

    const payload = validatePayload(GoogleAuthSchema, rawPayload);

    const user = await authService.loginWithGoogle({
        code: payload.code
    });

    const cookie = createSessionCookie(user.token, false);

    return ok(
        { ...user.user },
        {
            headers: {
                'Set-Cookie': cookie
            }
        }
    );
}

export const POST = makeHandler(postHandler);
