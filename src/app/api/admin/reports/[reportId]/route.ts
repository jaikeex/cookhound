import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { contentReportService } from '@/server/services';
import {
    makeHandler,
    ok,
    readJson,
    validateParams,
    validatePayload
} from '@/server/utils/reqwest';
import { withAdmin } from '@/server/utils/reqwest/pipes';
import { withRateLimit } from '@/server/utils/rate-limit';
import { registerRouteDocs } from '@/server/utils/api-docs';
import { AuthLevel } from '@/common/types';
import { ReportStatus } from '@/common/types/reports/report';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const ReportParamsSchema = z.strictObject({
    reportId: z.coerce.number().int().positive()
});

/**
 * A report may only be moved forward, it can never be pushed back to pending.
 */
const ResolveReportSchema = z.strictObject({
    status: z.enum([
        ReportStatus.REVIEWING,
        ReportStatus.ACTIONED,
        ReportStatus.DISMISSED
    ]),
    resolution: z.string().trim().max(2000).optional()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Returns a single content report for the admin detail view.
 */
async function getHandler(request: NextRequest) {
    const { reportId } = validateParams(ReportParamsSchema, {
        reportId: request.nextUrl.pathname.split('/').at(-1)
    });
    const report = await contentReportService.getReportById(reportId);

    return ok(report);
}

/**
 * Records a moderation decision on a report.
 */
async function patchHandler(request: NextRequest) {
    const { reportId } = validateParams(ReportParamsSchema, {
        reportId: request.nextUrl.pathname.split('/').at(-1)
    });

    const rawPayload = await readJson(request);
    const payload = validatePayload(ResolveReportSchema, rawPayload);

    const report = await contentReportService.resolveReport(
        reportId,
        payload.status,
        payload.resolution
    );

    return ok(report);
}

export const GET = makeHandler(
    getHandler,
    withAdmin,
    withRateLimit({ maxRequests: 30, windowSizeInSeconds: 60 })
);

export const PATCH = makeHandler(
    patchHandler,
    withAdmin,
    withRateLimit({ maxRequests: 30, windowSizeInSeconds: 60 })
);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/admin/reports/{id}', {
    category: 'Admin',
    subcategory: 'Moderation',
    GET: {
        summary: 'Get a single content report.',
        description: 'Admin-only.',
        auth: AuthLevel.ADMIN,
        rateLimit: { maxRequests: 30, windowSizeInSeconds: 60 },
        clientUsage: [
            {
                apiClient: 'apiClient.admin.getReportById',
                hook: 'chqc.admin.useAdminReportDetail'
            }
        ],
        responses: {
            200: 'Report detail',
            401: 'Not authenticated',
            403: 'Not an admin',
            404: 'Report not found',
            429: 'Rate limit exceeded'
        }
    },
    PATCH: {
        summary: 'Resolve a content report.',
        description: `Admin-only. Sets the report status (reviewing / actioned /
            dismissed) and, on a terminal decision, emails the reporter a
            statement of reasons.`,
        auth: AuthLevel.ADMIN,
        rateLimit: { maxRequests: 30, windowSizeInSeconds: 60 },
        bodySchema: ResolveReportSchema,
        clientUsage: [
            {
                apiClient: 'apiClient.admin.resolveReport',
                hook: 'chqc.admin.useResolveReport'
            }
        ],
        responses: {
            200: 'Report updated',
            400: 'Validation failed',
            401: 'Not authenticated',
            403: 'Not an admin',
            404: 'Report not found',
            429: 'Rate limit exceeded'
        }
    }
});
