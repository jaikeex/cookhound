import { AuthErrorUnauthorized, ValidationError } from '@/server/error/server';
import { logRequest, logResponse } from '@/server/logger';
import { userService } from '@/server/services';
import { withRateLimit } from '@/server/utils/rate-limit';
import { RequestContext } from '@/server/utils/reqwest/context';
import { handleServerError, validatePayload } from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApplicationErrorCode } from '@/server/error/codes';
import { withAuth } from '@/server/utils/session/with-auth';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const ChangeEmailSchema = z.strictObject({
    newEmail: z.string().email().trim(),
    password: z.string().min(1).max(100).trim()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles POST requests to `/api/users/me/email` to initiate an e-mail change request.
 *
 * ! This endpoint is restricted and only accessible to authenticated users.
 *
 * @param request - The incoming Next.js request object.
 * @returns 204 No Content on success.
 */
async function initiateEmailChangeHandler(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const userId = RequestContext.getUserId();

            if (!userId) {
                throw new AuthErrorUnauthorized();
            }

            const rawPayload = await request.json();

            const payload = validatePayload(ChangeEmailSchema, rawPayload);

            await userService.initiateEmailChange(
                userId,
                payload.newEmail,
                payload.password
            );

            const response = new Response(null, { status: 204 });

            logResponse(response);

            return response;
        } catch (error: unknown) {
            return handleServerError(error);
        }
    });
}

export const POST = withRateLimit(withAuth(initiateEmailChangeHandler), {
    maxRequests: 5,
    windowSizeInSeconds: 60 * 60 // 1 hour
});

/**
 * Handles PUT requests to `/api/users/me/email` to confirm an e-mail change via token.
 *
 * @param request - The incoming Next.js request object.
 * @returns 200 OK with updated `UserDTO` on success.
 */
export async function PUT(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const token = request.nextUrl.searchParams.get('token');

            if (!token) {
                throw new ValidationError(
                    undefined,
                    ApplicationErrorCode.MISSING_FIELD
                );
            }

            const updatedUser = await userService.confirmEmailChange(token);

            const response = Response.json(updatedUser);

            logResponse(response);

            return response;
        } catch (error: unknown) {
            return handleServerError(error);
        }
    });
}
