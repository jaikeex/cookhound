import type {
    AdminDashboardStatsDTO,
    AdminUserDetailDTO,
    AdminUserListDTO,
    ContentReportDTO,
    ContentReportListDTO
} from '@/common/types';

/**
 * Domain port for admin operations.
 */
export interface AdminRepository {
    //~=========================================================================================~//
    //$                                        DASHBOARD                                        $//
    //~=========================================================================================~//

    getDashboardStats(args: {
        signal?: AbortSignal;
    }): Promise<AdminDashboardStatsDTO>;

    //~=========================================================================================~//
    //$                                     USER MANAGEMENT                                     $//
    //~=========================================================================================~//

    listUsers(args: {
        params: Record<string, string | number | undefined>;
        signal?: AbortSignal;
    }): Promise<AdminUserListDTO>;

    getUserById(args: {
        userId: number;
        signal?: AbortSignal;
    }): Promise<AdminUserDetailDTO>;

    //~=========================================================================================~//
    //$                                        MUTATIONS                                        $//
    //~=========================================================================================~//

    changeUserRole(args: { userId: number; role: string }): Promise<void>;

    changeUserStatus(args: {
        userId: number;
        status: string;
        reason?: string;
    }): Promise<void>;

    forceLogout(args: { userId: number }): Promise<void>;

    forcePasswordReset(args: { userId: number }): Promise<void>;

    verifyEmail(args: { userId: number }): Promise<void>;

    scheduleAccountDeletion(args: {
        userId: number;
        reason?: string;
    }): Promise<void>;

    cancelAccountDeletion(args: { userId: number }): Promise<void>;

    //~=========================================================================================~//
    //$                                       MODERATION                                       $//
    //~=========================================================================================~//

    listReports(args: {
        params: Record<string, string | number | undefined>;
        signal?: AbortSignal;
    }): Promise<ContentReportListDTO>;

    getReportById(args: {
        reportId: number;
        signal?: AbortSignal;
    }): Promise<ContentReportDTO>;

    resolveReport(args: {
        reportId: number;
        status: string;
        resolution?: string;
    }): Promise<ContentReportDTO>;
}
