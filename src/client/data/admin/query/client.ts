import { useAppMutation, useAppQuery } from '@/client/data/queryFactories';
import { useRepositories } from '@/client/data';
import {
    ADMIN_QUERY_KEYS,
    type AdminReportDetailOptions,
    type AdminReportsOptions,
    type AdminUserDetailOptions,
    type AdminUsersOptions,
    type CancelAccountDeletionOptions,
    type ChangeUserRoleOptions,
    type ChangeUserStatusOptions,
    type DashboardStatsOptions,
    type ForceLogoutOptions,
    type ForcePasswordResetOptions,
    type ResolveReportOptions,
    type ScheduleAccountDeletionOptions,
    type VerifyEmailOptions
} from './keys';

export const adminQueryClient = {
    //~=========================================================================================~//
    //$                                        DASHBOARD                                        $//
    //~=========================================================================================~//

    /**
     * Fetches aggregated admin dashboard statistics.
     */
    useDashboardStats: (options?: Partial<DashboardStatsOptions>) => {
        const { adminRepository } = useRepositories();

        return useAppQuery(
            ADMIN_QUERY_KEYS.dashboardStats,
            ({ signal }) => adminRepository.getDashboardStats({ signal }),
            { staleTime: 30_000, ...options }
        );
    },

    //~=========================================================================================~//
    //$                                     USER MANAGEMENT                                     $//
    //~=========================================================================================~//

    /**
     * Fetches a paginated, filterable list of users.
     */
    useAdminUsers: (
        params: Record<string, string | number | undefined>,
        options?: Partial<AdminUsersOptions>
    ) => {
        const { adminRepository } = useRepositories();

        return useAppQuery(
            ADMIN_QUERY_KEYS.users(params),
            ({ signal }) => adminRepository.listUsers({ params, signal }),
            { staleTime: 10_000, ...options }
        );
    },

    /**
     * Fetches full admin-level detail for a single user.
     */
    useAdminUserDetail: (
        userId: number,
        options?: Partial<AdminUserDetailOptions>
    ) => {
        const { adminRepository } = useRepositories();

        return useAppQuery(
            ADMIN_QUERY_KEYS.userDetail(userId),
            ({ signal }) => adminRepository.getUserById({ userId, signal }),
            { staleTime: 10_000, ...options }
        );
    },

    //~=========================================================================================~//
    //$                                        MUTATIONS                                        $//
    //~=========================================================================================~//

    useChangeUserRole: (options?: Partial<ChangeUserRoleOptions>) => {
        const { adminRepository } = useRepositories();

        return useAppMutation(adminRepository.changeUserRole, options);
    },

    useChangeUserStatus: (options?: Partial<ChangeUserStatusOptions>) => {
        const { adminRepository } = useRepositories();

        return useAppMutation(adminRepository.changeUserStatus, options);
    },

    useForceLogout: (options?: Partial<ForceLogoutOptions>) => {
        const { adminRepository } = useRepositories();

        return useAppMutation(adminRepository.forceLogout, options);
    },

    useForcePasswordReset: (options?: Partial<ForcePasswordResetOptions>) => {
        const { adminRepository } = useRepositories();

        return useAppMutation(adminRepository.forcePasswordReset, options);
    },

    useVerifyEmail: (options?: Partial<VerifyEmailOptions>) => {
        const { adminRepository } = useRepositories();

        return useAppMutation(adminRepository.verifyEmail, options);
    },

    useScheduleAccountDeletion: (
        options?: Partial<ScheduleAccountDeletionOptions>
    ) => {
        const { adminRepository } = useRepositories();

        return useAppMutation(adminRepository.scheduleAccountDeletion, options);
    },

    useCancelAccountDeletion: (
        options?: Partial<CancelAccountDeletionOptions>
    ) => {
        const { adminRepository } = useRepositories();

        return useAppMutation(adminRepository.cancelAccountDeletion, options);
    },

    //~=========================================================================================~//
    //$                                       MODERATION                                       $//
    //~=========================================================================================~//

    /**
     * Fetches a paginated, filterable list of content reports.
     */
    useAdminReports: (
        params: Record<string, string | number | undefined>,
        options?: Partial<AdminReportsOptions>
    ) => {
        const { adminRepository } = useRepositories();

        return useAppQuery(
            ADMIN_QUERY_KEYS.reports(params),
            ({ signal }) => adminRepository.listReports({ params, signal }),
            { staleTime: 10_000, ...options }
        );
    },

    /**
     * Fetches a single content report for the admin detail view.
     */
    useAdminReportDetail: (
        reportId: number,
        options?: Partial<AdminReportDetailOptions>
    ) => {
        const { adminRepository } = useRepositories();

        return useAppQuery(
            ADMIN_QUERY_KEYS.reportDetail(reportId),
            ({ signal }) => adminRepository.getReportById({ reportId, signal }),
            { staleTime: 10_000, ...options }
        );
    },

    /**
     * Records a moderation decision on a report.
     */
    useResolveReport: (options?: Partial<ResolveReportOptions>) => {
        const { adminRepository } = useRepositories();

        return useAppMutation(adminRepository.resolveReport, options);
    }
};
