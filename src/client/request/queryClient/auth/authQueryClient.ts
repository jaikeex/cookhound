import {
    useAppQuery,
    useAppMutation
} from '@/client/request/queryClient/queryFactories';
import apiClient from '@/client/request/apiClient';
import type {
    CurrentUserOptions,
    LoginOptions,
    GoogleLoginOptions,
    LogoutOptions
} from './types';
import { AUTH_QUERY_KEYS } from './types';

// This is fine (not a component, just declarations here).
/* eslint-disable react-hooks/rules-of-hooks */

class AuthQueryClient {
    /**
     * Returns the currently logged-in user.
     *
     * Key: AUTH_QUERY_KEYS.currentUser
     * Stale time: 5 minutes
     * Retry: 1
     * refetchOnMount: true
     */
    useCurrentUser = (options?: Partial<CurrentUserOptions>) =>
        useAppQuery(
            AUTH_QUERY_KEYS.currentUser,
            apiClient.auth.getCurrentUser,
            {
                staleTime: 5 * 60 * 1000, // 5 minutes
                retry: 1,
                refetchOnMount: true,
                ...options
            }
        );

    /** Logs a user in locally with email/password. */
    useLogin = (options?: Partial<LoginOptions>) =>
        useAppMutation(apiClient.auth.login, options);

    /** Logs a user in with Google OAuth code exchange. */
    useLoginWithGoogleOauth = (options?: Partial<GoogleLoginOptions>) =>
        useAppMutation(apiClient.auth.loginWithGoogleOauth, options);

    /** Logs the current user out. */
    useLogout = (options?: Partial<LogoutOptions>) =>
        useAppMutation(apiClient.auth.logout, options);

    /** Logs the current user out on all devices. */
    useLogoutAll = (options?: Partial<LogoutOptions>) =>
        useAppMutation(apiClient.auth.logoutAll, options);
}

export const authQueryClient = new AuthQueryClient();
