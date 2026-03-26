import {
    useAppMutation,
    useAppQuery
} from '@/client/request/queryClient/queryFactories';
import apiClient from '@/client/request/apiClient';
import type {
    AdminUserDetailOptions,
    AdminUsersOptions,
    DashboardStatsOptions
} from './types';
import { ADMIN_QUERY_KEYS } from './types';

// This is fine (not a component, just declarations here).
/* eslint-disable react-hooks/rules-of-hooks */

class AdminQueryClient {
    //~=========================================================================================~//
    //$                                        DASHBOARD                                        $//
    //~=========================================================================================~//

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

    //~=========================================================================================~//
    //$                                     USER MANAGEMENT                                     $//
    //~=========================================================================================~//

    /**
     * Fetches a paginated, filterable list of users.
     *
     * Key: ['admin', 'users', params]
     * Stale time: 10 seconds
     */
    useAdminUsers = (
        params: Record<string, string | number | undefined>,
        options?: Partial<AdminUsersOptions>
    ) =>
        useAppQuery(
            [...ADMIN_QUERY_KEYS.users, params] as const,
            () => apiClient.admin.getUsers(params),
            { staleTime: 10_000, ...options }
        );

    /**
     * Fetches full admin-level detail for a single user.
     *
     * Key: ['admin', 'user-detail', userId]
     * Stale time: 10 seconds
     */
    useAdminUserDetail = (
        userId: number,
        options?: Partial<AdminUserDetailOptions>
    ) =>
        useAppQuery(
            [...ADMIN_QUERY_KEYS.userDetail, userId] as const,
            () => apiClient.admin.getUserById(userId),
            { staleTime: 10_000, ...options }
        );

    //~=========================================================================================~//
    //$                                        MUTATIONS                                        $//
    //~=========================================================================================~//

    useChangeUserRole = (options?: Parameters<typeof useAppMutation>[1]) =>
        useAppMutation(
            (args: { userId: number; role: string }) =>
                apiClient.admin.changeUserRole(args.userId, {
                    role: args.role
                }),
            options
        );

    useChangeUserStatus = (options?: Parameters<typeof useAppMutation>[1]) =>
        useAppMutation(
            (args: { userId: number; status: string; reason?: string }) =>
                apiClient.admin.changeUserStatus(args.userId, {
                    status: args.status,
                    reason: args.reason
                }),
            options
        );

    useForceLogout = (options?: Parameters<typeof useAppMutation>[1]) =>
        useAppMutation(
            (userId: number) => apiClient.admin.forceLogout(userId),
            options
        );

    useForcePasswordReset = (options?: Parameters<typeof useAppMutation>[1]) =>
        useAppMutation(
            (userId: number) => apiClient.admin.forcePasswordReset(userId),
            options
        );

    useVerifyEmail = (options?: Parameters<typeof useAppMutation>[1]) =>
        useAppMutation(
            (userId: number) => apiClient.admin.verifyEmail(userId),
            options
        );

    useScheduleAccountDeletion = (
        options?: Parameters<typeof useAppMutation>[1]
    ) =>
        useAppMutation(
            (args: { userId: number; reason?: string }) =>
                apiClient.admin.scheduleAccountDeletion(
                    args.userId,
                    args.reason ? { reason: args.reason } : undefined
                ),
            options
        );

    useCancelAccountDeletion = (
        options?: Parameters<typeof useAppMutation>[1]
    ) =>
        useAppMutation(
            (userId: number) => apiClient.admin.cancelAccountDeletion(userId),
            options
        );
}

export const adminQueryClient = new AdminQueryClient();
