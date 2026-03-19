import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { adminService } from '@/server/services';
import {
    makeHandler,
    noContent,
    readJson,
    validateParams,
    validatePayload
} from '@/server/utils/reqwest';
import { withAdmin } from '@/server/utils/reqwest/pipes';
import { withRateLimit } from '@/server/utils/rate-limit';
import type { UserRole } from '@/common/types';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const UserIdParamsSchema = z.strictObject({
    userId: z.coerce.number().int().positive()
});

const ChangeRoleSchema = z.strictObject({
    role: z.enum(['user', 'admin'])
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Changes a user's role.
 */
async function patchHandler(request: NextRequest) {
    const segments = request.nextUrl.pathname.split('/');
    const userIdIndex = segments.indexOf('users') + 1;

    const { userId } = validateParams(UserIdParamsSchema, {
        userId: segments[userIdIndex]
    });

    const body = await readJson(request);
    const { role } = validatePayload(ChangeRoleSchema, body);

    await adminService.changeUserRole(userId, role as UserRole);

    return noContent();
}

export const PATCH = makeHandler(
    patchHandler,
    withAdmin,
    withRateLimit({ maxRequests: 30, windowSizeInSeconds: 60 })
);
