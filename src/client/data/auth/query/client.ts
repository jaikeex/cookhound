import { useAppQuery, useAppMutation } from '@/client/data/queryFactories';
import { useRepositories } from '@/client/data/DataProvider';
import { getCookie } from '@/client/utils/cookies';
import { RequestError } from '@/client/error';
import { SESSION_HINT_COOKIE_NAME } from '@/common/constants/general';
import type { User } from '@/common/types';
import {
    AUTH_QUERY_KEYS,
    type CurrentUserOptions,
    type GoogleLoginOptions,
    type LoginOptions,
    type LogoutOptions
} from './keys';

export const authQueryClient = {
    /**
     * Returns the currently logged-in user.
     *
     * Key: AUTH_QUERY_KEYS.currentUser
     * Stale time: 0 (see below)
     * Retry: 1 (except 401s)
     * refetchOnMount: true
     *
     * This query is NOT hydrated from the server. The root layout is
     * static, so it cannot prefetch a cookie-scoped current user.
     * Consequently the first paint on a full page load renders anonymous and
     * this query resolves the real user client-side on mount.
     *
     * staleTime is 0 on purpose. Every mount hits /api/auth/current, which
     * records a user visit as a side effect. Keeping the data immediately stale
     * is what makes refetchOnMount actually refetch on mount, so the visit gets
     * tracked on every page load. Raising staleTime would mark the data fresh,
     * skip the mount refetch, and silently stop tracking visits on load.
     *
     * The per-load route hit is intentional; the DB cost is contained by a throttle,
     * and all reads go through redis anyway.
     */
    useCurrentUser: (options?: Partial<CurrentUserOptions>) => {
        const { authRepository } = useRepositories();

        return useAppQuery(
            AUTH_QUERY_KEYS.currentUser,
            ({ signal }) => {
                // This check must be part of the logic itself, not be passed as
                // enabled prop in react query options. getCookie() returns null during
                // prerender and the root layout is static, so gating enabled
                // on the hint produced a load of hydration errors, all about
                // the loading state of th ui.
                if (getCookie(SESSION_HINT_COOKIE_NAME) === null) {
                    return Promise.resolve<User | null>(null);
                }

                return authRepository.getCurrentUser({ signal });
            },
            {
                staleTime: 0,
                // absolutely no point in retrying resolved 401s
                retry: (failureCount, error) =>
                    error instanceof RequestError && error.status === 401
                        ? false
                        : failureCount < 1,
                refetchOnMount: true,
                ...options
            }
        );
    },

    /** Logs a user in locally with email/password. */
    useLogin: (options?: Partial<LoginOptions>) => {
        const { authRepository } = useRepositories();

        return useAppMutation(authRepository.login, options);
    },

    /** Logs a user in with Google OAuth code exchange. */
    useLoginWithGoogleOauth: (options?: Partial<GoogleLoginOptions>) => {
        const { authRepository } = useRepositories();

        return useAppMutation(authRepository.loginWithGoogleOauth, options);
    },

    /** Logs the current user out. */
    useLogout: (options?: Partial<LogoutOptions>) => {
        const { authRepository } = useRepositories();

        return useAppMutation(() => authRepository.logout(), options);
    },

    /** Logs the current user out on all devices. */
    useLogoutAll: (options?: Partial<LogoutOptions>) => {
        const { authRepository } = useRepositories();

        return useAppMutation(() => authRepository.logoutAll(), options);
    }
};
