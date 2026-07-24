import type { NextRequest } from 'next/server';
import { contentReportService } from '@/server/services';
import {
    validatePayload,
    makeHandler,
    created,
    readJson,
    withAuth
} from '@/server/utils/reqwest';
import { withRateLimit } from '@/server/utils/rate-limit';
import { z } from 'zod';
import { registerRouteDocs } from '@/server/utils/api-docs';
import { AuthLevel } from '@/common/types';
import { ReportReason, ReportTargetType } from '@/common/constants';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const ReportForCreateSchema = z.strictObject({
    targetType: z.enum(ReportTargetType),
    targetId: z.coerce.number().int().positive(),
    reason: z.enum(ReportReason),
    details: z.string().trim().max(2000).optional()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles POST requests to /api/reports for a user to report a piece of
 * content.
 *
 * ! Restricted to authenticated users.
 *
 * - 201: Report filed.
 * - 400: Validation failed, unknown target type, or self-report of a profile.
 * - 401: Not authenticated.
 * - 404: Reported target does not exist.
 * - 409: Caller already has an open report on this target.
 * - 429: Rate limit exceeded.
 */
async function postHandler(request: NextRequest) {
    const rawPayload = await readJson(request);
    const payload = validatePayload(ReportForCreateSchema, rawPayload);

    const report = await contentReportService.createReport(payload);

    return created(report);
}

export const POST = makeHandler(
    postHandler,
    withAuth,
    withRateLimit({
        maxRequests: 10,
        windowSizeInSeconds: 60 * 60 // 1 hour
    })
);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/reports', {
    category: 'Reports',
    POST: {
        summary: 'Report a piece of content.',
        description: `Authenticated users only. Files a content
            report and enqueues a confirmation email plus a moderation notification. Only
            one open report per user per target is allowed.`,
        auth: AuthLevel.AUTHENTICATED,
        rateLimit: { maxRequests: 10, windowSizeInSeconds: 3600 },
        bodySchema: ReportForCreateSchema,
        clientUsage: [
            {
                apiClient: 'apiClient.report.submitReport',
                hook: 'chqc.report.useSubmitReport'
            }
        ],
        responses: {
            201: 'Report filed',
            400: 'Validation failed or self-report',
            401: 'Not authenticated',
            404: 'Reported target not found',
            409: 'An open report already exists for this target',
            429: 'Rate limit exceeded'
        }
    }
});
