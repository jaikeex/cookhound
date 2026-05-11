'use client';

import { userApiClient } from '@/client/request/apiClient/user/UserApiClient';
import { reviveUserDates } from '@/client/request/apiClient/user/utils';
import type { UserRepository } from '@/client/data/user/port';

/**
 * HTTP-backed implementation of {@link UserRepository}.
 *
 * The adapter is the single place where DTO→domain mapping happens for user
 * reads (date revival via {@link reviveUserDates}). It also adapts the legacy
 * positional API on `userApiClient` into the object-shaped port.
 */
export const httpUserRepository: UserRepository = {
    getById: async ({ id, signal }) => {
        const dto = await userApiClient.getUserById(id, { signal });
        return reviveUserDates(dto);
    },

    create: async ({ input }) => {
        const dto = await userApiClient.createUser(input);
        return reviveUserDates(dto);
    },

    update: async ({ id, patch }) => {
        const dto = await userApiClient.updateUserById(id, patch);
        return reviveUserDates(dto);
    },

    getShoppingList: ({ id, signal }) =>
        userApiClient.getShoppingList(id, { signal }),

    upsertShoppingList: ({ id, data }) =>
        userApiClient.upsertShoppingList(id, data),

    updateShoppingList: ({ id, data }) =>
        userApiClient.updateShoppingList(id, data),

    deleteShoppingList: async ({ id, data }) => {
        await userApiClient.deleteShoppingList(id, data);
    },

    getLastViewedRecipes: ({ id, signal }) =>
        userApiClient.getUserLastViewedRecipes(id, { signal }),

    createCookieConsent: ({ input }) =>
        userApiClient.createUserCookieConsent(input),

    updatePreferences: async ({ id, data }) => {
        await userApiClient.updateUserPreferences(id, data);
    },

    initiateEmailChange: async ({ newEmail, password }) => {
        await userApiClient.initiateEmailChange({ newEmail, password });
    },

    confirmEmailChange: async ({ token }) => {
        const dto = await userApiClient.confirmEmailChange(token);
        return reviveUserDates(dto);
    },

    verifyEmail: async ({ token }) => {
        await userApiClient.verifyEmail(token);
    },

    resendVerificationEmail: async ({ email }) => {
        await userApiClient.resendVerificationEmail(email);
    },

    sendResetPasswordEmail: async ({ input }) => {
        await userApiClient.sendResetPasswordEmail(input);
    },

    resetPassword: async ({ input }) => {
        await userApiClient.resetPassword(input);
    },

    initiateAccountDeletion: ({ input }) =>
        userApiClient.initiateAccountDeletion(input),

    cancelAccountDeletion: async () => {
        await userApiClient.cancelAccountDeletion();
    }
};
