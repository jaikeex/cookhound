import type { NextRequest } from 'next/server';
import { authService } from '@/server/services/auth/service';
import { AuthErrorForbidden } from '@/server/error';
import {
    assertAnonymous,
    makeHandler,
    ok,
    readJson,
    validatePayload
} from '@/server/utils/reqwest';
import { z } from 'zod';
import { ApplicationErrorCode } from '@/server/error/codes';
import { createSessionCookie } from '@/server/utils/session/cookie';
import { withRateLimit } from '@/server/utils/rate-limit';
import { registerRouteDocs, UserResponseSchema } from '@/server/utils/api-docs';
import { AuthLevel } from '@/common/types';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const LoginSchema = z.object({
    email: z.email(),
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
async function postHandler(request: NextRequest) {
    assertAnonymous(
        new AuthErrorForbidden(
            'auth.error.user-already-logged-in',
            ApplicationErrorCode.ALREADY_LOGGED_IN
        )
    );

    const rawPayload = await readJson(request);

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

    return ok(
        { ...user.user },
        {
            headers: {
                'Set-Cookie': cookie
            }
        }
    );
}

export const POST = makeHandler(
    postHandler,
    withRateLimit({
        maxRequests: 10,
        windowSizeInSeconds: 60
    })
);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/auth/login', {
    category: 'Auth',
    subcategory: 'Credentials',
    POST: {
        summary: 'Authenticate a user with email and password.',
        description: `Creates a session and sets a cookie. The
            keepLoggedIn flag extends session lifetime.`,
        auth: AuthLevel.GUEST,
        rateLimit: { maxRequests: 10, windowSizeInSeconds: 60 },
        bodySchema: LoginSchema,
        clientUsage: [
            { apiClient: 'apiClient.auth.login', hook: 'chqc.auth.useLogin' }
        ],
        responses: {
            200: {
                description: 'User data with session cookie',
                schema: UserResponseSchema
            },
            400: 'Validation failed',
            401: 'Invalid credentials',
            403: 'Already authenticated',
            429: 'Rate limit exceeded'
        }
    }
});
