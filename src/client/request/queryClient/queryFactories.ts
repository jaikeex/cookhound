import {
    useQuery as tanstackUseQuery,
    useMutation as tanstackUseMutation,
    type QueryKey,
    type UseQueryOptions,
    type UseQueryResult,
    type UseMutationOptions,
    type UseMutationResult
} from '@tanstack/react-query';
import type { RequestError } from '@/client/error';

/**
 * Typed wrapper around {@link useQuery} that pre-fills the error type and infers the data type
 * from the provided queryFn.
 */
export function useAppQuery<
    TKey extends QueryKey,
    TFn extends () => Promise<any>
>(
    queryKey: TKey,
    queryFn: TFn,
    options?: Omit<
        UseQueryOptions<
            AwaitedReturn<TFn>,
            RequestError,
            AwaitedReturn<TFn>,
            TKey
        >,
        'queryKey' | 'queryFn'
    >
): UseQueryResult<AwaitedReturn<TFn>, RequestError> {
    return tanstackUseQuery({ queryKey, queryFn, ...options });
}

/**
 * Typed wrapper around {@link useMutation} that pre-fills the error type and infers the data type
 * from the provided mutationFn.
 */
export function useAppMutation<TFn extends (...args: any[]) => Promise<any>>(
    mutationFn: TFn,
    options?: Omit<
        UseMutationOptions<
            AwaitedReturn<TFn>,
            RequestError,
            Parameters<TFn>[0]
        >,
        'mutationFn'
    >
): UseMutationResult<AwaitedReturn<TFn>, RequestError, Parameters<TFn>[0]> {
    return tanstackUseMutation({ mutationFn, ...options });
}
