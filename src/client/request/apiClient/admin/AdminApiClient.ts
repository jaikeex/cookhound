import type { RequestConfig } from '@/client/request/apiClient/ApiRequestWrapper';
import { apiRequestWrapper } from '@/client/request/apiClient/ApiRequestWrapper';
import type { AdminDashboardStatsDTO } from '@/common/types';

/**
 * API client for admin endpoints.
 */
class AdminApiClient {
    /**
     * Fetches aggregated dashboard statistics by calling `GET /admin/stats`.
     *
     * @param config - Optional fetch request configuration.
     * @returns Dashboard stats DTO.
     */
    async getDashboardStats(
        config?: RequestConfig
    ): Promise<AdminDashboardStatsDTO> {
        return await apiRequestWrapper.get<AdminDashboardStatsDTO>({
            url: '/admin/stats',
            ...config
        });
    }
}

export const adminApiClient = new AdminApiClient();
