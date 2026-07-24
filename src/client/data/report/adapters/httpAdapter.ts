'use client';

import { reportApiClient } from '@/client/request/apiClient/report';
import type { ReportRepository } from '@/client/data/report/port';

/**
 * HTTP-backed implementation of {@link ReportRepository}.
 *
 * The result is a DTO that the admin surface consumes as-is,
 * so no date revival happens here.
 */
export const httpReportRepository: ReportRepository = {
    submit: (payload) => reportApiClient.submitReport(payload)
};
