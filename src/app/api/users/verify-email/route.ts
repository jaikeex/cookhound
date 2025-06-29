import { ServerError } from '@/server/error/server';
import { logRequest, logResponse } from '@/server/logger';
import { userService } from '@/server/services';
import { RequestContext } from '@/server/utils/reqwest/context';
import { handleServerError, validatePayload } from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const SendVerificationEmailSchema = z.strictObject({
    email: z.string().trim().email()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles POST requests to `/api/users/verify-email` to resend a verification email.
 *
 * @returns A JSON response indicating the result of the operation.
 * @todo Implement the logic to resend a verification email.
 */
export async function POST(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const rawPayload = await request.json();

            const payload = validatePayload(
                SendVerificationEmailSchema,
                rawPayload
            );

            const { email } = payload;

            await userService.resendVerificationEmail(email);

            const response = Response.json({
                message: 'Verification email sent'
            });

            logResponse(response);
            return response;
        } catch (error: any) {
            return handleServerError(error);
        }
    });
}

/**
 * Handles PUT requests to `/api/users/verify-email` to verify a user's email address.
 * It uses a token from the query parameters to verify the email.
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
export async function PUT(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const token = request.nextUrl.searchParams.get('token');

            if (!token) {
                throw new ServerError('app.error.bad-request', 400);
            }

            await userService.verifyEmail(token);

            const response = Response.json({
                message: 'Email verified successfully'
            });

            logResponse(response);
            return response;
        } catch (error: any) {
            return handleServerError(error);
        }
    });
}
