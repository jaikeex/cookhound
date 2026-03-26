import type { UseQueryOptions } from '@tanstack/react-query';
import type {
    AdminDashboardStatsDTO,
    AdminUserDetailDTO,
    AdminUserListDTO
} from '@/common/types';
import type { RequestError } from '@/client/error';

const ADMIN_NAMESPACE_QUERY_KEY = 'admin';

export const ADMIN_QUERY_KEYS = Object.freeze({
    namespace: ADMIN_NAMESPACE_QUERY_KEY,
    dashboardStats: [ADMIN_NAMESPACE_QUERY_KEY, 'dashboard-stats'] as const,
    users: [ADMIN_NAMESPACE_QUERY_KEY, 'users'] as const,
    userDetail: [ADMIN_NAMESPACE_QUERY_KEY, 'user-detail'] as const
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

export type AdminUsersOptions = Omit<
    UseQueryOptions<
        AdminUserListDTO,
        RequestError,
        AdminUserListDTO,
        readonly [string, string, ...unknown[]]
    >,
    'queryKey' | 'queryFn'
>;

export type AdminUserDetailOptions = Omit<
    UseQueryOptions<
        AdminUserDetailDTO,
        RequestError,
        AdminUserDetailDTO,
        readonly [string, string, number]
    >,
    'queryKey' | 'queryFn'
>;
