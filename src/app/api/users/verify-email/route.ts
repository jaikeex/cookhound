import { AuthErrorForbidden, ValidationError } from '@/server/error/server';
import { userService } from '@/server/services';
import {
    assertAnonymous,
    makeHandler,
    noContent,
    readJson,
    validatePayload
} from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApplicationErrorCode } from '@/server/error/codes';
import { withRateLimit } from '@/server/utils/rate-limit';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const SendVerificationEmailSchema = z.strictObject({
    email: z.email().trim()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles POST requests to `/api/users/verify-email` to resend a verification email.
 *
 * ! This endpoint is restricted and only accessible to guests.
 *
 * @returns A JSON response indicating the result of the operation.
 * @todo Implement the logic to resend a verification email.
 */
async function postHandler(request: NextRequest) {
    assertAnonymous(
        new AuthErrorForbidden(
            'auth.error.user-already-logged-in',
            ApplicationErrorCode.ALREADY_LOGGED_IN
        )
    );

    const rawPayload = await readJson(request);

    const payload = validatePayload(SendVerificationEmailSchema, rawPayload);

    const { email } = payload;

    await userService.resendVerificationEmail(email);

    return noContent();
}

/**
 * Handles PUT requests to `/api/users/verify-email` to verify a user's email address.
 * It uses a token from the query parameters to verify the email.
 *
 * ! This endpoint is restricted and only accessible to guests.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response indicating success or failure of the email verification.
 *
 * - 200: Success, with a success message.
 * - 400: Bad Request, if the token is missing.
 * - 403: Forbidden, if the email is already verified.
 * - 404: Not Found, if the user is not found.
 * - 500: Internal Server Error, if there is another error during email verification.
 */
async function putHandler(request: NextRequest) {
    assertAnonymous(
        new AuthErrorForbidden(
            'auth.error.user-already-logged-in',
            ApplicationErrorCode.ALREADY_LOGGED_IN
        )
    );

    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
        throw new ValidationError(
            undefined,
            ApplicationErrorCode.MISSING_FIELD
        );
    }

    await userService.verifyEmail(token);

    return noContent();
}

export const POST = makeHandler(
    postHandler,
    withRateLimit({
        maxRequests: 10,
        windowSizeInSeconds: 60
    })
);

export const PUT = makeHandler(
    putHandler,
    withRateLimit({
        maxRequests: 10,
        windowSizeInSeconds: 60
    })
);
