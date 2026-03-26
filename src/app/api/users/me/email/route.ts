import { ValidationError } from '@/server/error/server';
import { userService } from '@/server/services';
import { withRateLimit } from '@/server/utils/rate-limit';
import {
    assertAuthenticated,
    makeHandler,
    noContent,
    ok,
    readJson,
    validatePayload
} from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApplicationErrorCode } from '@/server/error/codes';
import { withAuth } from '@/server/utils/reqwest';
import { registerRouteDocs, UserResponseSchema } from '@/server/utils/api-docs';
import { AuthLevel } from '@/common/types';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const ChangeEmailSchema = z.strictObject({
    newEmail: z.email().trim(),
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
async function postHandler(request: NextRequest) {
    const userId = assertAuthenticated();

    const rawPayload = await readJson(request);

    const payload = validatePayload(ChangeEmailSchema, rawPayload);

    await userService.initiateEmailChange(
        userId,
        payload.newEmail,
        payload.password
    );

    return noContent();
}

/**
 * Handles PUT requests to `/api/users/me/email` to confirm an e-mail change via token.
 *
 * @param request - The incoming Next.js request object.
 * @returns 200 OK with updated `UserDTO` on success.
 */
async function putHandler(request: NextRequest) {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
        throw new ValidationError(
            undefined,
            ApplicationErrorCode.MISSING_FIELD
        );
    }

    const updatedUser = await userService.confirmEmailChange(token);

    return ok(updatedUser);
}

export const POST = makeHandler(
    postHandler,
    withAuth,
    withRateLimit({
        maxRequests: 5,
        windowSizeInSeconds: 60 * 60 // 1 hour
    })
);

export const PUT = makeHandler(
    putHandler,
    withRateLimit({
        maxRequests: 5,
        windowSizeInSeconds: 60 * 60 // 1 hour
    })
);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/users/me/email', {
    category: 'Users',
    subcategory: 'Account',
    POST: {
        summary: 'Request an email address change.',
        description: `Sends a confirmation link to the new address.
            Not applied until confirmed.`,
        auth: AuthLevel.AUTHENTICATED,
        rateLimit: { maxRequests: 5, windowSizeInSeconds: 3600 },
        bodySchema: ChangeEmailSchema,
        clientUsage: [
            {
                apiClient: 'apiClient.user.initiateEmailChange',
                hook: 'chqc.user.useInitiateEmailChange'
            }
        ],
        responses: {
            204: 'Confirmation email sent',
            400: 'Validation failed',
            401: 'Not authenticated',
            429: 'Rate limit exceeded'
        }
    },
    PUT: {
        summary: 'Verify and complete an email change via token.',
        description: `Confirms the email change using the
            verification token.`,
        auth: AuthLevel.PUBLIC,
        rateLimit: { maxRequests: 5, windowSizeInSeconds: 3600 },
        clientUsage: [
            {
                apiClient: 'apiClient.user.confirmEmailChange',
                hook: 'chqc.user.useConfirmEmailChange'
            }
        ],
        responses: {
            200: {
                description: 'Email changed, updated user data',
                schema: UserResponseSchema
            },
            400: 'Invalid or expired token',
            429: 'Rate limit exceeded'
        }
    }
});
