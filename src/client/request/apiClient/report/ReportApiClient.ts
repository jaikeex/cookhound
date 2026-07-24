import type { RequestConfig } from '@/client/request/apiClient/ApiRequestWrapper';
import { apiRequestWrapper } from '@/client/request/apiClient/ApiRequestWrapper';
import type { ContentReportDTO, ReportPayload } from '@/common/types';

/**
 * Service for content-report operations.
 */
class ReportApiClient {
    /**
     * Files a content report by calling POST /reports.
     *
     * @param data - The report payload (targetType, targetId, reason, details).
     * @param config - The fetch request configuration.
     *
     * @returns {Promise<ContentReportDTO>} The created report.
     * - 201: Report filed.
     *
     * @throws {RequestError} Throws if the request fails.
     * - 400: Validation failed or self-report.
     * - 401: Not authenticated.
     * - 404: Reported target not found.
     * - 409: An open report already exists for this target.
     * - 429: Rate limit exceeded.
     */
    async submitReport(
        data: ReportPayload,
        config?: RequestConfig
    ): Promise<ContentReportDTO> {
        return await apiRequestWrapper.post<ContentReportDTO>({
            url: '/reports',
            data,
            ...config
        });
    }
}

export const reportApiClient = new ReportApiClient();
