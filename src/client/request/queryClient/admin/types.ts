import type { UseQueryOptions } from '@tanstack/react-query';
import type { AdminDashboardStatsDTO } from '@/common/types';
import type { RequestError } from '@/client/error';

const ADMIN_NAMESPACE_QUERY_KEY = 'admin';

export const ADMIN_QUERY_KEYS = Object.freeze({
    namespace: ADMIN_NAMESPACE_QUERY_KEY,
    dashboardStats: [ADMIN_NAMESPACE_QUERY_KEY, 'dashboard-stats'] as const
});

export type DashboardStatsOptions = Omit<
    UseQueryOptions<
        AdminDashboardStatsDTO,
        RequestError,
        AdminDashboardStatsDTO,
        typeof ADMIN_QUERY_KEYS.dashboardStats
    >,
    'queryKey' | 'queryFn'
>;
