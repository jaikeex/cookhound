import { isI18nMessage, t, type I18nMessage } from '@/client/locales';

type TranslationParams = Record<string, string | number | boolean>;

/**
 * Resolves any thrown value to a translation key that is safe to display.
 */
export function getErrorMessageKey(
    error: unknown,
    fallback: I18nMessage = 'app.error.default'
): I18nMessage {
    return error instanceof Error && isI18nMessage(error.message)
        ? error.message
        : fallback;
}

export function getErrorMessage(
    error: unknown,
    options?: Readonly<{ fallback?: I18nMessage; params?: TranslationParams }>
): string {
    return t(getErrorMessageKey(error, options?.fallback), options?.params);
}
