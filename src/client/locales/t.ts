import * as cs from './cs.json';

export type I18nMessage = keyof typeof cs;
export type Messages = Record<I18nMessage, string>;

export const csMessages: Messages = cs;

export function t(
    key: I18nMessage | undefined,
    params?: Record<string, string | number | boolean>,
    fallback?: string
): string {
    if (!key) return '';

    const message = csMessages[key];

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
        return csMessages[fallback as I18nMessage] || fallback;
    }

    return key;
}
