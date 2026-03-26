import { NotFoundError, ValidationError } from '@/server/error';
import { ApplicationErrorCode } from '@/server/error/codes';
import { userService } from '@/server/services';
import { withRateLimit } from '@/server/utils/rate-limit/wrapper';
import {
    assertSelfOrAdmin,
    makeHandler,
    ok,
    readJson,
    validatePayload
} from '@/server/utils/reqwest';
import { withAuth } from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { registerRouteDocs, UserResponseSchema } from '@/server/utils/api-docs';
import { AuthLevel } from '@/common/types';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const UserForUpdateSchema = z.strictObject({
    username: z.string().trim().min(3).max(40).optional(),
    avatarUrl: z.url().optional()
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
async function getHandler(request: NextRequest) {
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

    return ok(user);
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
async function putHandler(request: NextRequest) {
    const userId = request.nextUrl.pathname.split('/').pop();

    if (!userId || isNaN(Number(userId))) {
        throw new ValidationError(
            'app.error.bad-request',
            ApplicationErrorCode.MISSING_FIELD
        );
    }

    const rawPayload = await readJson(request);

    assertSelfOrAdmin(Number(userId));

    const payload = validatePayload(UserForUpdateSchema, rawPayload);

    const { username, avatarUrl } = payload;

    if (!username && !avatarUrl) {
        throw new ValidationError(
            'app.error.bad-request',
            ApplicationErrorCode.MISSING_FIELD
        );
    }

    const user = await userService.updateOneById(Number(userId), payload);

    return ok(user);
}

export const GET = makeHandler(getHandler);
export const PUT = makeHandler(
    putHandler,
    withAuth,
    withRateLimit({
        maxRequests: 10,
        windowSizeInSeconds: 60
    })
);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/users/{id}', {
    category: 'Users',
    subcategory: 'Profile',
    GET: {
        summary: 'Get a user profile by ID.',
        description: `Own profile returns full details; other
            users receive a public subset.`,
        auth: AuthLevel.PUBLIC,
        clientUsage: [
            {
                apiClient: 'apiClient.user.getUserById',
                hook: 'chqc.user.useGetUserById'
            }
        ],
        responses: {
            200: {
                description: 'User profile data',
                schema: UserResponseSchema
            },
            400: 'Invalid user ID',
            404: 'User not found'
        }
    },
    PUT: {
        summary: 'Update a user profile.',
        description: `Owner-only. Updates the caller's own
            profile.`,
        auth: AuthLevel.AUTHENTICATED,
        rateLimit: { maxRequests: 10, windowSizeInSeconds: 60 },
        bodySchema: UserForUpdateSchema,
        clientUsage: [
            {
                apiClient: 'apiClient.user.updateUserById',
                hook: 'chqc.user.useUpdateUserById'
            }
        ],
        responses: {
            200: {
                description: 'Updated user data',
                schema: UserResponseSchema
            },
            400: 'Validation failed',
            401: 'Not authenticated',
            403: 'Not authorized',
            429: 'Rate limit exceeded'
        }
    }
});
