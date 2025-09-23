import type { Locale } from '@/common/types';
import { DEFAULT_LOCALE } from '@/common/constants';

/**
 * Generic strongly-typed e-mail template definition.
 *
 * @template L – list of supported locales
 * @template Args – arguments forwarded to the template body renderer
 */
export interface MailTemplate<Args extends unknown[] = []> {
    subject: Record<Locale, string>;
    body: Record<Locale, (...args: Args) => string>;
}

/**
 * Picks the subject and body for a given locale.
 *
 * @param template – Template object containing subjects and bodies for every locale.
 * @param locale – Requested locale.
 * @param args – Arguments forwarded to the body generator.
 */
export function createTemplate<Args extends unknown[]>(
    template: MailTemplate<Args>,
    locale: Locale,
    ...args: Args
): { subject: string; html: string } {
    const lang = locale in template.subject ? locale : DEFAULT_LOCALE;

    const subject =
        (template.subject as Record<string, string>)[lang] ??
        template.subject[DEFAULT_LOCALE];

    const html =
        (template.body as Record<string, (...args: Args) => string>)[lang]?.(
            ...args
        ) ?? template.body[DEFAULT_LOCALE]?.(...args);

    return { subject, html };
}
