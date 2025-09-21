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
export async function putHandler(request: NextRequest) {
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
        maxRequests: 20,
        windowSizeInSeconds: 60 // 1 minute
    })
);
