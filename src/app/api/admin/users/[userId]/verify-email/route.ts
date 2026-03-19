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
 * Manually verifies a user's email address (admin-initiated).
 */
async function patchHandler(request: NextRequest) {
    const segments = request.nextUrl.pathname.split('/');
    const userIdIndex = segments.indexOf('users') + 1;

    const { userId } = validateParams(UserIdParamsSchema, {
        userId: segments[userIdIndex]
    });

    await adminService.verifyEmail(userId);

    return noContent();
}

export const PATCH = makeHandler(
    patchHandler,
    withAdmin,
    withRateLimit({ maxRequests: 30, windowSizeInSeconds: 60 })
);
