import {
    MutationCache,
    QueryCache,
    type Mutation,
    type Query
} from '@tanstack/react-query';
import { getErrorMessage, RequestError } from '@/client/error';
import { AppEvent, eventBus } from '@/client/events';
import { t } from '@/client/locales';
import { ROUTES } from '@/common/constants';

const DEFAULT_QUERY_RETRIES = 3;

const isRateLimited = (error: unknown): boolean =>
    error instanceof RequestError && error.status === 429;

/**
 * Default query retry policy. A 429 is never retried: each retry would land in
 * the same rate-limit window and extend the lockout before the redirect fires.
 */
export const retryUnlessRateLimited = (
    failureCount: number,
    error: unknown
): boolean => !isRateLimited(error) && failureCount < DEFAULT_QUERY_RETRIES;

const redirectToRateLimitPage = () => {
    if (typeof window !== 'undefined') {
        window.location.href = ROUTES.error.tooManyRequests;
    }
};

export function handleQueryError(
    error: unknown,
    query: Query<unknown, unknown, unknown>
): void {
    if (query.meta?.silent) {
        return;
    }

    if (isRateLimited(error)) {
        redirectToRateLimitPage();
    }
}

export function handleMutationError(
    error: unknown,
    mutation: Mutation<unknown, unknown, unknown>
): void {
    const meta = mutation.meta;

    if (meta?.silent) {
        return;
    }

    // The page is being replaced, a snackbar would only flash.
    if (isRateLimited(error)) {
        redirectToRateLimitPage();
        return;
    }

    if (meta?.errorMessage === false) {
        return;
    }

    void eventBus.emit(AppEvent.REQUEST_FAILED, {
        message: meta?.errorMessage
            ? t(meta.errorMessage)
            : getErrorMessage(error)
    });
}

export const createQueryCache = () => {
    return new QueryCache({ onError: handleQueryError });
};

export const createMutationCache = () => {
    return new MutationCache({
        onError: (error, _variables, _onMutateResult, mutation) =>
            handleMutationError(error, mutation)
    });
};
