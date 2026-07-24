import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { contentReportService } from '@/server/services';
import { makeHandler, ok, validateQuery } from '@/server/utils/reqwest';
import { withAdmin } from '@/server/utils/reqwest/pipes';
import { withRateLimit } from '@/server/utils/rate-limit';
import { registerRouteDocs } from '@/server/utils/api-docs';
import { AuthLevel } from '@/common/types';
import { ReportStatus } from '@/common/types/reports/report';
import { ReportTargetType } from '@/common/constants';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const AdminReportsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(25),
    status: z.enum(ReportStatus).optional(),
    targetType: z.enum(ReportTargetType).optional()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Returns a paginated, filterable list of content reports, newest first.
 */
async function getHandler(request: NextRequest) {
    const query = validateQuery(AdminReportsQuerySchema, request.nextUrl);

    const result = await contentReportService.listReports(query);

    return ok(result);
}

export const GET = makeHandler(
    getHandler,
    withAdmin,
    withRateLimit({ maxRequests: 30, windowSizeInSeconds: 60 })
);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/admin/reports', {
    category: 'Admin',
    subcategory: 'Moderation',
    GET: {
        summary: 'List content reports with filtering and pagination.',
        description: `Admin-only. Paginated and filterable by status and target
            type.`,
        auth: AuthLevel.ADMIN,
        rateLimit: { maxRequests: 30, windowSizeInSeconds: 60 },
        querySchema: AdminReportsQuerySchema,
        clientUsage: [
            {
                apiClient: 'apiClient.admin.getReports',
                hook: 'chqc.admin.useAdminReports'
            }
        ],
        responses: {
            200: 'Paginated report list',
            401: 'Not authenticated',
            403: 'Not an admin',
            429: 'Rate limit exceeded'
        }
    }
});
