import type { RequestConfig } from '@/client/request/apiClient/ApiRequestWrapper';
import { apiRequestWrapper } from '@/client/request/apiClient/ApiRequestWrapper';
import type {
    AdminDashboardStatsDTO,
    AdminUserDetailDTO,
    AdminUserListDTO
} from '@/common/types';

/**
 * API client for admin endpoints.
 */
class AdminApiClient {
    /**
     * Fetches aggregated dashboard statistics by calling `GET /admin/stats`.
     */
    async getDashboardStats(
        config?: RequestConfig
    ): Promise<AdminDashboardStatsDTO> {
        return await apiRequestWrapper.get<AdminDashboardStatsDTO>({
            url: '/admin/stats',
            ...config
        });
    }

    /**
     * Fetches a paginated, filterable list of users by calling `GET /admin/users`.
     */
    async getUsers(
        params: Record<string, string | number | undefined>,
        config?: RequestConfig
    ): Promise<AdminUserListDTO> {
        return await apiRequestWrapper.get<AdminUserListDTO>({
            url: '/admin/users',
            params,
            ...config
        });
    }

    /**
     * Fetches full admin-level detail for a single user.
     */
    async getUserById(
        userId: number,
        config?: RequestConfig
    ): Promise<AdminUserDetailDTO> {
        return await apiRequestWrapper.get<AdminUserDetailDTO>({
            url: `/admin/users/${userId}`,
            ...config
        });
    }

    /**
     * Changes a user's role.
     */
    async changeUserRole(
        userId: number,
        data: { role: string }
    ): Promise<void> {
        await apiRequestWrapper.patch({
            url: `/admin/users/${userId}/role`,
            data: data
        });
    }

    /**
     * Changes a user's status (ban/unban).
     */
    async changeUserStatus(
        userId: number,
        data: { status: string; reason?: string }
    ): Promise<void> {
        await apiRequestWrapper.patch({
            url: `/admin/users/${userId}/status`,
            data: data
        });
    }

    /**
     * Force-logs out a user by invalidating all their sessions.
     */
    async forceLogout(userId: number): Promise<void> {
        await apiRequestWrapper.post({
            url: `/admin/users/${userId}/force-logout`
        });
    }

    /**
     * Triggers a password reset email for a user.
     */
    async forcePasswordReset(userId: number): Promise<void> {
        await apiRequestWrapper.post({
            url: `/admin/users/${userId}/force-password-reset`
        });
    }

    /**
     * Manually verifies a user's email address.
     */
    async verifyEmail(userId: number): Promise<void> {
        await apiRequestWrapper.patch({
            url: `/admin/users/${userId}/verify-email`
        });
    }

    /**
     * Schedules a user's account for deletion.
     */
    async scheduleAccountDeletion(
        userId: number,
        data?: { reason?: string }
    ): Promise<void> {
        await apiRequestWrapper.delete({
            url: `/admin/users/${userId}`,
            data: data ?? {}
        });
    }

    /**
     * Cancels a pending account deletion, restoring the user to active status.
     */
    async cancelAccountDeletion(userId: number): Promise<void> {
        await apiRequestWrapper.post({
            url: `/admin/users/${userId}/cancel-deletion`
        });
    }
}

export const adminApiClient = new AdminApiClient();
