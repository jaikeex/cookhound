import { UserRole } from '@/common/types';
import {
    AuthErrorUnauthorized,
    NotFoundError,
    ValidationError
} from '@/server/error';
import { ApplicationErrorCode } from '@/server/error/codes';
import { logRequest, logResponse } from '@/server/logger';
import { userService } from '@/server/services';
import { handleServerError, validatePayload } from '@/server/utils/reqwest';
import { RequestContext } from '@/server/utils/reqwest/context';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const UserForUpdateSchema = z.strictObject({
    username: z.string().trim().min(3).max(40).optional(),
    avatarUrl: z.string().trim().url().optional()
});

//|=============================================================================================|//
//?                                          HANDLERS                                           ?//
//|=============================================================================================|//

/**
 * Handles GET requests to `/api/users/{id}` to fetch a specific user.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with the user data.
 * @throws {Error} Throws an error if the request fails.
 *
 * - 200: Success, with user data.
 * - 400: Bad Request, if the user ID is not a number.
 * - 404: Not Found, if the user is not found.
 * - 500: Internal Server Error, if there is another error during the fetching process.
 */
export async function GET(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const userId = request.nextUrl.pathname.split('/').pop();

            /**
             * Do NOT validate the params by schema here, requesting a user that does
             * not exist should return a 404 error and be handled by the service, not a 400.
             */

            if (!userId) {
                throw new ValidationError(
                    'app.error.bad-request',
                    ApplicationErrorCode.MISSING_FIELD
                );
            }

            const user = await userService.getUserById(Number(userId));

            if (!user) {
                throw new NotFoundError(
                    'app.error.not-found',
                    ApplicationErrorCode.USER_NOT_FOUND
                );
            }

            const response = Response.json(user);

            logResponse(response);
            return response;
        } catch (error: unknown) {
            return handleServerError(error);
        }
    });
}

/**
 * Handles PUT requests to `/api/users/{id}` to update a specific user.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with the updated user data.
 * @throws {Error} Throws an error if the request fails.
 *
 * - 200: Success, with the updated user data.
 * - 400: Bad Request, if the user ID is not a number.
 * - 401: Unauthorized, if the user is not authenticated.
 * - 404: Not Found, if the user is not found.
 * - 500: Internal Server Error, if there is another error during the updating process.
 */
export async function PUT(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            if (RequestContext.getUserRole() === UserRole.Guest) {
                throw new AuthErrorUnauthorized();
            }

            const userId = request.nextUrl.pathname.split('/').pop();

            if (!userId || isNaN(Number(userId))) {
                throw new ValidationError(
                    'app.error.bad-request',
                    ApplicationErrorCode.MISSING_FIELD
                );
            }

            const rawPayload = await request.json();

            const payload = validatePayload(UserForUpdateSchema, rawPayload);

            const { username, avatarUrl } = payload;

            if (!username && !avatarUrl) {
                throw new ValidationError(
                    'app.error.bad-request',
                    ApplicationErrorCode.MISSING_FIELD
                );
            }

            const user = await userService.updateOneById(
                Number(userId),
                payload
            );

            const response = Response.json(user);

            logResponse(response);

            return response;
        } catch (error: unknown) {
            return handleServerError(error);
        }
    });
}
