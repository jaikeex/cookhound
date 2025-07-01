import type { UserDTO, UserForLogin, AuthCodePayload } from '@/common/types';
import type {
    UseQueryOptions,
    UseMutationOptions
} from '@tanstack/react-query';
import type { RequestError } from '@/client/error';
import type { RequestConfig } from '@/client/request/apiClient/ApiRequestWrapper';

//~---------------------------------------------------------------------------------------------~//
//$                                            KEYS                                             $//
//~---------------------------------------------------------------------------------------------~//

const AUTH_NAMESPACE_QUERY_KEY = 'auth';

export const AUTH_QUERY_KEYS = Object.freeze({
    namespace: AUTH_NAMESPACE_QUERY_KEY,
    currentUser: [AUTH_NAMESPACE_QUERY_KEY, 'current'] as const
});

//~---------------------------------------------------------------------------------------------~//
//$                                         TYPES                                             $//
//~---------------------------------------------------------------------------------------------~//

export type CurrentUserOptions = Omit<
    UseQueryOptions<
        UserDTO,
        RequestError,
        UserDTO,
        typeof AUTH_QUERY_KEYS.currentUser
    >,
    'queryKey' | 'queryFn'
>;

export type LoginOptions = Omit<
    UseMutationOptions<UserDTO, RequestError, UserForLogin>,
    'mutationFn'
>;

export type GoogleLoginOptions = Omit<
    UseMutationOptions<UserDTO, RequestError, AuthCodePayload>,
    'mutationFn'
>;

export type LogoutOptions = Omit<
    UseMutationOptions<void, RequestError, RequestConfig | undefined>,
    'mutationFn'
>;
