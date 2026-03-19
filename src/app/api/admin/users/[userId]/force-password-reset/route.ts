import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { adminService } from '@/server/services';
import { makeHandler, noContent, validateParams } from '@/server/utils/reqwest';
import { withAdmin } from '@/server/utils/reqwest/pipes';
import { withRateLimit } from '@/server/utils/rate-limit';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const UserIdParamsSchema = z.strictObject({
    userId: z.coerce.number().int().positive()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Triggers a password reset email for a user (admin-initiated).
 */
async function postHandler(request: NextRequest) {
    const segments = request.nextUrl.pathname.split('/');
    const userIdIndex = segments.indexOf('users') + 1;

    const { userId } = validateParams(UserIdParamsSchema, {
        userId: segments[userIdIndex]
    });

    await adminService.forcePasswordReset(userId);

    return noContent();
}

export const POST = makeHandler(
    postHandler,
    withAdmin,
    withRateLimit({ maxRequests: 30, windowSizeInSeconds: 60 })
);
