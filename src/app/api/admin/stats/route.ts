import type { NextRequest } from 'next/server';
import { adminService } from '@/server/services';
import { makeHandler, ok } from '@/server/utils/reqwest';
import { withAdmin } from '@/server/utils/reqwest/pipes';
import { withRateLimit } from '@/server/utils/rate-limit';
import {
    registerRouteDocs,
    AdminStatsResponseSchema
} from '@/server/utils/api-docs';
import { AuthLevel } from '@/common/types';

/**
 * Returns aggregated admin dashboard statistics.
 */
async function getHandler(_request: NextRequest) {
    const stats = await adminService.getDashboardStats();
    return ok(stats);
}

export const GET = makeHandler(
    getHandler,
    withAdmin,
    withRateLimit({ maxRequests: 30, windowSizeInSeconds: 60 })
);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/admin/stats', {
    category: 'Admin',
    subcategory: 'Dashboard',
    GET: {
        summary: 'Get admin dashboard statistics.',
        description: `Returns aggregated platform statistics.`,
        auth: AuthLevel.ADMIN,
        rateLimit: { maxRequests: 30, windowSizeInSeconds: 60 },
        clientUsage: [
            {
                apiClient: 'apiClient.admin.getDashboardStats',
                hook: 'chqc.admin.useDashboardStats'
            }
        ],
        responses: {
            200: {
                description: 'Dashboard statistics',
                schema: AdminStatsResponseSchema
            },
            401: 'Not authenticated',
            403: 'Not an admin',
            429: 'Rate limit exceeded'
        }
    }
});
