import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { adminService } from '@/server/services';
import { makeHandler, noContent, validateParams } from '@/server/utils/reqwest';
import { withAdmin } from '@/server/utils/reqwest/pipes';
import { withRateLimit } from '@/server/utils/rate-limit';
import { registerRouteDocs } from '@/server/utils/api-docs/registry';
import { AuthLevel } from '@/common/types';

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
 * Cancels a pending account deletion, restoring the user to active status.
 */
async function postHandler(request: NextRequest) {
    const segments = request.nextUrl.pathname.split('/');
    const userIdIndex = segments.indexOf('users') + 1;

    const { userId } = validateParams(UserIdParamsSchema, {
        userId: segments[userIdIndex]
    });

    await adminService.cancelAccountDeletion(userId);

    return noContent();
}

export const POST = makeHandler(
    postHandler,
    withAdmin,
    withRateLimit({ maxRequests: 30, windowSizeInSeconds: 60 })
);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/admin/users/{userId}/cancel-deletion', {
    category: 'Admin',
    subcategory: 'User Actions',
    POST: {
        summary: 'Cancel a pending user account deletion.',
        description: `Restores the account to active status.`,
        auth: AuthLevel.ADMIN,
        rateLimit: { maxRequests: 30, windowSizeInSeconds: 60 },
        clientUsage: [
            {
                apiClient: 'apiClient.admin.cancelAccountDeletion',
                hook: 'chqc.admin.useCancelAccountDeletion'
            }
        ],
        responses: {
            204: 'Deletion cancelled',
            401: 'Not authenticated',
            403: 'Not an admin or targeting self',
            404: 'User not found or not pending deletion',
            429: 'Rate limit exceeded'
        }
    }
});
