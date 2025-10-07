import { locales } from '@/client/locales';
import type { Locale, I18nMessage } from '@/client/locales';
import { DEFAULT_LOCALE } from '@/common/constants';

/**
 * Server-side translation function
 *
 * @param locale - The locale to translate to
 * @param key - The translation key
 * @param params - Optional parameters to replace in the translation
 * @param fallback - Optional fallback string if key is not found
 * @returns The translated string
 */
export function tServer(
    locale: Locale,
    key: I18nMessage | undefined,
    params?: Record<string, string | number | boolean>,
    fallback?: string
): string {
    if (!key) return '';

    const messages = locales[locale] || locales[DEFAULT_LOCALE];
    let message = messages[key];

    if (!message && locale !== DEFAULT_LOCALE) {
        message = locales[DEFAULT_LOCALE][key];
    }

    if (message && params) {
        return Object.keys(params).reduce(
            (acc, param) =>
                acc.replace(
                    new RegExp(`{{${param}}}`, 'g'),
                    String(params[param])
                ),
            message
        );
    }

    if (message) {
        return message;
    }

    if (fallback) {
        return fallback;
    }

    return key;
}

/**
 * Loads all messages for a given locale
 *
 * @param locale - The locale to load messages for
 * @returns Record of all translation messages for the locale
 */
export function getMessages(locale: Locale): Record<string, string> {
    return { ...locales[locale] };
}
