import type { NextRequest } from 'next/server';
import { adminService } from '@/server/services';
import { makeHandler, ok } from '@/server/utils/reqwest';
import { withAdmin } from '@/server/utils/reqwest/pipes';
import { withRateLimit } from '@/server/utils/rate-limit';

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
