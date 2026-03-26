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
import type { Status } from '@/common/types';
import { registerRouteDocs } from '@/server/utils/api-docs/registry';
import { AuthLevel } from '@/common/types';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const UserIdParamsSchema = z.strictObject({
    userId: z.coerce.number().int().positive()
});

const ChangeStatusSchema = z.strictObject({
    status: z.enum(['active', 'banned']),
    reason: z.string().max(500).optional()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Changes a user's status (ban/unban).
 */
async function patchHandler(request: NextRequest) {
    const segments = request.nextUrl.pathname.split('/');
    const userIdIndex = segments.indexOf('users') + 1;

    const { userId } = validateParams(UserIdParamsSchema, {
        userId: segments[userIdIndex]
    });

    const body = await readJson(request);
    const { status, reason } = validatePayload(ChangeStatusSchema, body);

    await adminService.changeUserStatus(userId, status as Status, reason);

    return noContent();
}

export const PATCH = makeHandler(
    patchHandler,
    withAdmin,
    withRateLimit({ maxRequests: 30, windowSizeInSeconds: 60 })
);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/admin/users/{userId}/status', {
    category: 'Admin',
    subcategory: 'User Actions',
    PATCH: {
        summary: "Change a user's status (ban/unban).",
        description: `Banning invalidates all sessions. Cannot
            target own account.`,
        auth: AuthLevel.ADMIN,
        rateLimit: { maxRequests: 30, windowSizeInSeconds: 60 },
        bodySchema: ChangeStatusSchema,
        clientUsage: [
            {
                apiClient: 'apiClient.admin.changeUserStatus',
                hook: 'chqc.admin.useChangeUserStatus'
            }
        ],
        responses: {
            204: 'Status updated',
            400: 'Invalid status',
            401: 'Not authenticated',
            403: 'Not an admin or targeting self',
            404: 'User not found',
            429: 'Rate limit exceeded'
        }
    }
});
