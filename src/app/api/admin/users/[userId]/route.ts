import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { adminService } from '@/server/services';
import {
    makeHandler,
    noContent,
    ok,
    readJson,
    validateParams,
    validatePayload
} from '@/server/utils/reqwest';
import { withAdmin } from '@/server/utils/reqwest/pipes';
import { withRateLimit } from '@/server/utils/rate-limit';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const UserIdParamsSchema = z.strictObject({
    userId: z.coerce.number().int().positive()
});

const ScheduleDeletionSchema = z.strictObject({
    reason: z.string().max(500).optional()
});

//|=============================================================================================|//
//?                                           HELPERS                                           ?//
//|=============================================================================================|//

function extractUserId(request: NextRequest): number {
    const segments = request.nextUrl.pathname.split('/');
    const userIdIndex = segments.indexOf('users') + 1;

    const { userId } = validateParams(UserIdParamsSchema, {
        userId: segments[userIdIndex]
    });

    return userId;
}

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Returns full admin-level detail for a single user.
 */
async function getHandler(request: NextRequest) {
    const userId = extractUserId(request);
    const user = await adminService.getUserById(userId);

    return ok(user);
}

/**
 * Schedules a user's account for deletion (30-day grace period).
 */
async function deleteHandler(request: NextRequest) {
    const userId = extractUserId(request);
    const body = await readJson(request);
    const { reason } = validatePayload(ScheduleDeletionSchema, body);

    await adminService.scheduleAccountDeletion(userId, reason);

    return noContent();
}

export const GET = makeHandler(
    getHandler,
    withAdmin,
    withRateLimit({ maxRequests: 30, windowSizeInSeconds: 60 })
);

export const DELETE = makeHandler(
    deleteHandler,
    withAdmin,
    withRateLimit({ maxRequests: 30, windowSizeInSeconds: 60 })
);
