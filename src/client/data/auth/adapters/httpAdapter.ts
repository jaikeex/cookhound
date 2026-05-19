'use client';

import { authApiClient } from '@/client/request/apiClient/auth';
import { reviveUserDates } from '@/client/data/user/revive';
import type { AuthRepository } from '@/client/data/auth/port';

/**
 * HTTP-backed implementation of {@link AuthRepository}.
 */
export const httpAuthRepository: AuthRepository = {
    getCurrentUser: async ({ signal }) => {
        const dto = await authApiClient.getCurrentUser({ signal });
        return reviveUserDates(dto);
    },

    login: async (data) => {
        const dto = await authApiClient.login(data);
        return reviveUserDates(dto);
    },

    loginWithGoogleOauth: async (data) => {
        const dto = await authApiClient.loginWithGoogleOauth(data);
        return reviveUserDates(dto);
    },

    logout: async () => {
        await authApiClient.logout();
    },

    logoutAll: async () => {
        await authApiClient.logoutAll();
    }
};
