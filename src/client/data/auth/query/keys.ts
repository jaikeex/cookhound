import type { AuthCodePayload, User, UserForLogin } from '@/common/types';
import type {
    UseQueryOptions,
    UseMutationOptions
} from '@tanstack/react-query';
import type { RequestError } from '@/client/error';

//~---------------------------------------------------------------------------------------------~//
//$                                            KEYS                                             $//
//~---------------------------------------------------------------------------------------------~//

const AUTH_NAMESPACE_QUERY_KEY = 'auth';

export const AUTH_QUERY_KEYS = Object.freeze({
    namespace: AUTH_NAMESPACE_QUERY_KEY,
    currentUser: [AUTH_NAMESPACE_QUERY_KEY, 'current'] as const
});

//~---------------------------------------------------------------------------------------------~//
//$                                          TYPES                                              $//
//~---------------------------------------------------------------------------------------------~//

export type CurrentUserOptions = Omit<
    UseQueryOptions<
        User | null,
        RequestError,
        User | null,
        typeof AUTH_QUERY_KEYS.currentUser
    >,
    'queryKey' | 'queryFn'
>;

export type LoginOptions = Omit<
    UseMutationOptions<User, RequestError, UserForLogin>,
    'mutationFn'
>;

export type GoogleLoginOptions = Omit<
    UseMutationOptions<User, RequestError, AuthCodePayload>,
    'mutationFn'
>;

export type LogoutOptions = Omit<
    UseMutationOptions<void, RequestError, undefined>,
    'mutationFn'
>;
