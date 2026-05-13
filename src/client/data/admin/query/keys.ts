import type {
    AdminDashboardStatsDTO,
    AdminUserDetailDTO,
    AdminUserListDTO
} from '@/common/types';
import type {
    UseMutationOptions,
    UseQueryOptions
} from '@tanstack/react-query';
import type { RequestError } from '@/client/error';

//~---------------------------------------------------------------------------------------------~//
//$                                            KEYS                                             $//
//~---------------------------------------------------------------------------------------------~//

const ADMIN_NAMESPACE_QUERY_KEY = 'admin';

export const ADMIN_QUERY_KEYS = Object.freeze({
    namespace: ADMIN_NAMESPACE_QUERY_KEY,

    dashboardStats: [ADMIN_NAMESPACE_QUERY_KEY, 'dashboard-stats'] as const,

    users: (params: Record<string, string | number | undefined>) =>
        [ADMIN_NAMESPACE_QUERY_KEY, 'users', params] as const,

    userDetail: (userId: number) =>
        [ADMIN_NAMESPACE_QUERY_KEY, 'user-detail', userId] as const
});

//~---------------------------------------------------------------------------------------------~//
//$                                          TYPES                                              $//
//~---------------------------------------------------------------------------------------------~//

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
        ReturnType<typeof ADMIN_QUERY_KEYS.users>
    >,
    'queryKey' | 'queryFn'
>;

export type AdminUserDetailOptions = Omit<
    UseQueryOptions<
        AdminUserDetailDTO,
        RequestError,
        AdminUserDetailDTO,
        ReturnType<typeof ADMIN_QUERY_KEYS.userDetail>
    >,
    'queryKey' | 'queryFn'
>;

export type ChangeUserRoleOptions = Omit<
    UseMutationOptions<void, RequestError, { userId: number; role: string }>,
    'mutationFn'
>;

export type ChangeUserStatusOptions = Omit<
    UseMutationOptions<
        void,
        RequestError,
        { userId: number; status: string; reason?: string }
    >,
    'mutationFn'
>;

export type ForceLogoutOptions = Omit<
    UseMutationOptions<void, RequestError, { userId: number }>,
    'mutationFn'
>;

export type ForcePasswordResetOptions = Omit<
    UseMutationOptions<void, RequestError, { userId: number }>,
    'mutationFn'
>;

export type VerifyEmailOptions = Omit<
    UseMutationOptions<void, RequestError, { userId: number }>,
    'mutationFn'
>;

export type ScheduleAccountDeletionOptions = Omit<
    UseMutationOptions<void, RequestError, { userId: number; reason?: string }>,
    'mutationFn'
>;

export type CancelAccountDeletionOptions = Omit<
    UseMutationOptions<void, RequestError, { userId: number }>,
    'mutationFn'
>;
