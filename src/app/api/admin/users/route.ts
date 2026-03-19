import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { adminService } from '@/server/services';
import { makeHandler, ok, validateQuery } from '@/server/utils/reqwest';
import { withAdmin } from '@/server/utils/reqwest/pipes';
import { withRateLimit } from '@/server/utils/rate-limit';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const AdminUsersQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(25),
    search: z.string().max(128).optional(),
    role: z.enum(['user', 'admin']).optional(),
    status: z.enum(['active', 'pending_deletion', 'banned']).optional(),
    authType: z.enum(['local', 'google']).optional(),
    sortBy: z
        .enum(['createdAt', 'username', 'email', 'lastLogin', 'lastVisitedAt'])
        .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Returns a paginated, filterable list of users for the admin panel.
 */
async function getHandler(request: NextRequest) {
    const query = validateQuery(AdminUsersQuerySchema, request.nextUrl);

    const result = await adminService.getUsers(query);

    return ok(result);
}

export const GET = makeHandler(
    getHandler,
    withAdmin,
    withRateLimit({ maxRequests: 30, windowSizeInSeconds: 60 })
);
