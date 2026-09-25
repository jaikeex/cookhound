import { getErrorMessageKey } from '@/client/error';
import type { I18nMessage } from '@/client/locales';

/**
 * Derives the displayed form errors from local validation state plus the error of the
 * latest request. A locally set server error wins; pass mutation errors in priority order.
 */
export const withServerError = <T extends { server?: I18nMessage }>(
    errors: T,
    ...requestErrors: ReadonlyArray<unknown>
): T => {
    const requestError = requestErrors.find(Boolean);

    return requestError && !errors.server
        ? { ...errors, server: getErrorMessageKey(requestError) }
        : errors;
};
