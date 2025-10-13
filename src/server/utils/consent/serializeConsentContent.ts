import { Logger } from '@/server/logger';

const CONSENT_CONTENT: Record<string, readonly string[]> = {
    en: [
        'We value your privacy. Choose which cookies you want to allow. Essential cookies are always enabled as they are necessary for the website to function properly.',
        'Essential: Required for the website to function properly',
        'Preferences: Let us remember your preferred settings',
        'Analytics: Help us understand how visitors interact with our website',
        'Marketing: Personalize advertisements and measure their performance'
    ],
    cs: [
        'Vážíme si vašeho soukromí. Vyberte si, které cookies chcete povolit. Nezbytné cookies jsou vždy povoleny, protože jsou nutné pro správné fungování webu.',
        'Nezbytné: Nutné pro správné fungování webu',
        'Preference: Umožní nám zapamatovat si vaše preferované nastavení',
        'Analytika: Pomozte nám pochopit, jak návštěvníci interagují s našimi webovými stránkami',
        'Marketing: Personalizovat reklamy a měřit jejich výkon'
    ]
} as const;

const log = Logger.getInstance('serializeConsentContent');

/**
 * Serializes the cookie consent content into a consistent, deterministic string
 * that can be used for hash generation.
 *
 * @returns A deterministic string representation of the consent content
 */
export function serializeConsentContent(): string {
    const locales = Object.keys(CONSENT_CONTENT).sort();
    const parts: string[] = [];

    for (const locale of locales) {
        if (!CONSENT_CONTENT[locale]) {
            log.warn('serializeConsentContent - locale not found', { locale });
            continue;
        }

        parts.push(...CONSENT_CONTENT[locale]);
    }

    return parts.join('\n').replace(/\s+/g, ' ').trim();
}
