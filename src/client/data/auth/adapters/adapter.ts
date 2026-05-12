'use client';

import { authApiClient } from '@/client/request/apiClient/auth';
import { reviveUserDates } from '@/client/request/apiClient/user/utils';
import type { AuthRepository } from '@/client/data/auth/port';

/**
 * HTTP-backed implementation of {@link AuthRepository}.
 *
 * The adapter is the single place where DTO→domain mapping happens for
 * auth-shaped reads/writes (date revival via {@link reviveUserDates}). It
 * also adapts the legacy positional API on `authApiClient` into the
 * object-shaped port.
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
