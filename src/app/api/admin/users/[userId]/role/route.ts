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
import { registerRouteDocs } from '@/server/utils/api-docs/registry';
import { AuthLevel } from '@/common/types';

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

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/admin/users/{userId}/role', {
    category: 'Admin',
    subcategory: 'User Actions',
    PATCH: {
        summary: "Change a user's role.",
        description: `Cannot change own role.`,
        auth: AuthLevel.ADMIN,
        rateLimit: { maxRequests: 30, windowSizeInSeconds: 60 },
        bodySchema: ChangeRoleSchema,
        clientUsage: [
            {
                apiClient: 'apiClient.admin.changeUserRole',
                hook: 'chqc.admin.useChangeUserRole'
            }
        ],
        responses: {
            204: 'Role updated',
            400: 'Invalid role',
            401: 'Not authenticated',
            403: 'Not an admin or targeting self',
            404: 'User not found',
            429: 'Rate limit exceeded'
        }
    }
});
