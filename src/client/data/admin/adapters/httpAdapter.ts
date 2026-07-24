'use client';

import { adminApiClient } from '@/client/request/apiClient/admin';
import type { AdminRepository } from '@/client/data/admin/port';

/**
 * HTTP-backed implementation of {@link AdminRepository}.
 */
export const httpAdminRepository: AdminRepository = {
    getDashboardStats: ({ signal }) =>
        adminApiClient.getDashboardStats({ signal }),

    listUsers: ({ params, signal }) =>
        adminApiClient.getUsers(params, { signal }),

    getUserById: ({ userId, signal }) =>
        adminApiClient.getUserById(userId, { signal }),

    changeUserRole: async ({ userId, role }) => {
        await adminApiClient.changeUserRole(userId, { role });
    },

    changeUserStatus: async ({ userId, status, reason }) => {
        await adminApiClient.changeUserStatus(userId, { status, reason });
    },

    forceLogout: async ({ userId }) => {
        await adminApiClient.forceLogout(userId);
    },

    forcePasswordReset: async ({ userId }) => {
        await adminApiClient.forcePasswordReset(userId);
    },

    verifyEmail: async ({ userId }) => {
        await adminApiClient.verifyEmail(userId);
    },

    scheduleAccountDeletion: async ({ userId, reason }) => {
        await adminApiClient.scheduleAccountDeletion(
            userId,
            reason ? { reason } : undefined
        );
    },

    cancelAccountDeletion: async ({ userId }) => {
        await adminApiClient.cancelAccountDeletion(userId);
    },

    listReports: ({ params, signal }) =>
        adminApiClient.getReports(params, { signal }),

    getReportById: ({ reportId, signal }) =>
        adminApiClient.getReportById(reportId, { signal }),

    resolveReport: ({ reportId, status, resolution }) =>
        adminApiClient.resolveReport(reportId, { status, resolution })
};
