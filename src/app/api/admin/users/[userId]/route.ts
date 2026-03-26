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
import {
    registerRouteDocs,
    AdminUserDetailResponseSchema
} from '@/server/utils/api-docs';
import { AuthLevel } from '@/common/types';

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

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/admin/users/{userId}', {
    category: 'Admin',
    subcategory: 'User Management',
    GET: {
        summary: 'Get detailed user information.',
        description: `Returns full admin-level detail for a
            user.`,
        auth: AuthLevel.ADMIN,
        rateLimit: { maxRequests: 30, windowSizeInSeconds: 60 },
        clientUsage: [
            {
                apiClient: 'apiClient.admin.getUserById',
                hook: 'chqc.admin.useAdminUserDetail'
            }
        ],
        responses: {
            200: {
                description: 'Detailed user data',
                schema: AdminUserDetailResponseSchema
            },
            401: 'Not authenticated',
            403: 'Not an admin',
            404: 'User not found',
            429: 'Rate limit exceeded'
        }
    },
    DELETE: {
        summary: 'Schedule user account deletion.',
        description: `Cannot target own account.`,
        auth: AuthLevel.ADMIN,
        rateLimit: { maxRequests: 30, windowSizeInSeconds: 60 },
        bodySchema: ScheduleDeletionSchema,
        clientUsage: [
            {
                apiClient: 'apiClient.admin.scheduleAccountDeletion',
                hook: 'chqc.admin.useScheduleAccountDeletion'
            }
        ],
        responses: {
            204: 'Deletion scheduled',
            401: 'Not authenticated',
            403: 'Not an admin or targeting self',
            404: 'User not found',
            429: 'Rate limit exceeded'
        }
    }
});
