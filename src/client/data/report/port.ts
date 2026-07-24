import type { ContentReportDTO, ReportPayload } from '@/common/types';

/**
 * Domain port for content-report operations.
 */
export interface ReportRepository {
    /**
     * Files a content report and returns the created record.
     */
    submit(payload: ReportPayload): Promise<ContentReportDTO>;
}
