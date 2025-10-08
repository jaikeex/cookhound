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
import { withAuth } from '@/server/utils/reqwest';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const InitiateAccountDeletionSchema = z.strictObject({
    password: z.string().min(1).max(100).trim(),
    reason: z.string().max(500).trim().optional()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles POST requests to `/api/users/me/delete` to initiate account deletion.
 *
 * ! This endpoint is restricted and only accessible to authenticated users.
 *
 * @param request - The incoming Next.js request object.
 * @returns 200 OK with `{ scheduledFor: string, daysRemaining: number }` on success.
 */
async function postHandler(request: NextRequest) {
    const userId = assertAuthenticated();

    const rawPayload = await readJson(request);

    const payload = validatePayload(InitiateAccountDeletionSchema, rawPayload);

    const result = await userService.initiateAccountDeletion(
        userId,
        payload.password,
        payload.reason
    );

    return ok(result);
}

/**
 * Handles DELETE requests to `/api/users/me/delete` to cancel a pending account deletion.
 *
 * ! This endpoint is restricted and only accessible to authenticated users.
 *
 * @returns 204 No Content on success.
 */
async function deleteHandler() {
    const userId = assertAuthenticated();

    await userService.cancelAccountDeletion(userId);

    return noContent();
}

export const POST = makeHandler(
    postHandler,
    withAuth,
    withRateLimit({
        maxRequests: 5,
        windowSizeInSeconds: 60 * 60 // 1 hour
    })
);

export const DELETE = makeHandler(
    deleteHandler,
    withAuth,
    withRateLimit({
        maxRequests: 5,
        windowSizeInSeconds: 60 * 60 // 1 hour
    })
);
