import { useAppQuery, useAppMutation } from '@/client/data/queryFactories';
import { useRepositories } from '@/client/data';
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
     * Retry: 1
     * refetchOnMount: true
     *
     * staleTime is 0 on purpose. The server prefetch (layout.tsx) hydrates
     * this query from a side-effect-free read and never records a user visit.
     * Keeping the hydrated data immediately stale is what makes refetchOnMount
     * actually refetch on mount, hitting that route on every page load so the
     * visit gets tracked. Raising staleTime would mark the hydrated data fresh,
     * skip the mount refetch, and silently stop tracking visits on load.
     *
     * The per-load route hit is intentional; the DB cost is contained by a throttle,
     * and all reads go through redis anyway.
     */
    useCurrentUser: (options?: Partial<CurrentUserOptions>) => {
        const { authRepository } = useRepositories();

        return useAppQuery(
            AUTH_QUERY_KEYS.currentUser,
            ({ signal }) => authRepository.getCurrentUser({ signal }),
            {
                staleTime: 0,
                retry: 1,
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
