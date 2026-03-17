import { useAppQuery } from '@/client/request/queryClient/queryFactories';
import apiClient from '@/client/request/apiClient';
import type { DashboardStatsOptions } from './types';
import { ADMIN_QUERY_KEYS } from './types';

// This is fine (not a component, just declarations here).
/* eslint-disable react-hooks/rules-of-hooks */

class AdminQueryClient {
    /**
     * Fetches aggregated admin dashboard statistics.
     *
     * Key: ADMIN_QUERY_KEYS.dashboardStats
     * Stale time: 30 seconds
     */
    useDashboardStats = (options?: Partial<DashboardStatsOptions>) =>
        useAppQuery(
            ADMIN_QUERY_KEYS.dashboardStats,
            () => apiClient.admin.getDashboardStats(),
            { staleTime: 30_000, ...options }
        );
}

export const adminQueryClient = new AdminQueryClient();
