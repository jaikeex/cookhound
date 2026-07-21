import { Logger } from '@/server/logger';

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                              VERSION-KEYED CONSENT CONTENT                                  ?//
///
//# Each CONSENT_VERSION has its own frozen copy of the consent texts. The proof hash of every
//# stored consent record is computed from the text of the version the user actually consented
//# to, so verification must always be able to reproduce that exact text.
//#
//! NEVER EDIT ENTRIES FOR PAST VERSIONS
//# Changing a single character invalidates the proof hashes of every record stored under that
//# version. To change the consent wording, bump CONSENT_VERSION and add a NEW entry here.
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

const CONSENT_CONTENT_BY_VERSION: Record<
    string,
    Record<string, readonly string[]>
> = {
    '2025-10-08': {
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
    },
    '2026-07-21': {
        en: [
            'We value your privacy. Choose which cookies you want to allow. Essential cookies are always enabled as they are necessary for the website to function properly.',
            'Essential: Required for the website to function properly',
            'Preferences: Let us remember your preferred settings',
            'Analytics: Help us understand how visitors use our website. For traffic measurement we use Google Analytics, a service provided by Google LLC.',
            'Marketing: Personalize advertisements and measure their performance'
        ],
        cs: [
            'Vážíme si vašeho soukromí. Vyberte si, které cookies chcete povolit. Nezbytné cookies jsou vždy povoleny, protože jsou nutné pro správné fungování webu.',
            'Nezbytné: Nutné pro správné fungování webu',
            'Preference: Umožní nám zapamatovat si vaše preferované nastavení',
            'Analytika: Pomáhají nám pochopit, jak návštěvníci používají náš web. K měření návštěvnosti používáme službu Google Analytics společnosti Google LLC.',
            'Marketing: Personalizovat reklamy a měřit jejich výkon'
        ]
    }
} as const;

const log = Logger.getInstance('serializeConsentContent');

/**
 * Serializes the cookie consent content of a specific consent version into a
 * consistent, deterministic string that can be used for hash generation.
 *
 * @param version - Consent version whose text to serialize (e.g. '2026-07-21').
 * @returns A deterministic string representation of that version's consent content
 * @throws {Error} If no consent content is registered for the given version
 */
export function serializeConsentContent(version: string): string {
    const content = CONSENT_CONTENT_BY_VERSION[version];

    if (!content) {
        log.error('serializeConsentContent - unknown consent version', {
            version
        });
        throw new Error(
            `No consent content registered for version "${version}"`
        );
    }

    const locales = Object.keys(content).sort();
    const parts: string[] = [];

    for (const locale of locales) {
        const localeContent = content[locale];

        if (!localeContent) {
            log.warn('serializeConsentContent - locale not found', { locale });
            continue;
        }

        parts.push(...localeContent);
    }

    return parts.join('\n').replace(/\s+/g, ' ').trim();
}
