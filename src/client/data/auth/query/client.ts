import {
    useAppQuery,
    useAppMutation
} from '@/client/request/queryClient/queryFactories';
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
     * Stale time: 5 minutes
     * Retry: 1
     * refetchOnMount: true
     */
    useCurrentUser: (options?: Partial<CurrentUserOptions>) => {
        const { authRepository } = useRepositories();

        return useAppQuery(
            AUTH_QUERY_KEYS.currentUser,
            ({ signal }) => authRepository.getCurrentUser({ signal }),
            {
                staleTime: 5 * 60 * 1000, // 5 minutes
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
