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

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/admin/users/{userId}/force-password-reset', {
    category: 'Admin',
    subcategory: 'User Actions',
    POST: {
        summary: 'Send a forced password reset email to a user.',
        description: `Triggers a password reset email to the
            user.`,
        auth: AuthLevel.ADMIN,
        rateLimit: { maxRequests: 30, windowSizeInSeconds: 60 },
        clientUsage: [
            {
                apiClient: 'apiClient.admin.forcePasswordReset',
                hook: 'chqc.admin.useForcePasswordReset'
            }
        ],
        responses: {
            204: 'Password reset email sent',
            401: 'Not authenticated',
            403: 'Not an admin or targeting self',
            404: 'User not found',
            429: 'Rate limit exceeded'
        }
    }
});
