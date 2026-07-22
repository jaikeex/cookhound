import { describe, it, expect } from 'vitest';
import { serializeConsentContent } from './serializeConsentContent';
import { CONSENT_VERSION } from '@/common/constants';

//|=============================================================================================|//
//?                                        FIXTURES                                             ?//
//|=============================================================================================|//

/**
 * The exact serialized output of the '2025-10-08' consent content, captured
 * from the original (pre-version-keying) implementation.
 *
 * ! Every proof hash stored under that version depends on this string verbatim.
 * ! If this test ever fails, historical consent proofs no longer verify.
 */
const LEGACY_SERIALIZED_CONTENT =
    'Vážíme si vašeho soukromí. Vyberte si, které cookies chcete povolit. Nezbytné cookies jsou vždy povoleny, protože jsou nutné pro správné fungování webu. Nezbytné: Nutné pro správné fungování webu Preference: Umožní nám zapamatovat si vaše preferované nastavení Analytika: Pomozte nám pochopit, jak návštěvníci interagují s našimi webovými stránkami Marketing: Personalizovat reklamy a měřit jejich výkon We value your privacy. Choose which cookies you want to allow. Essential cookies are always enabled as they are necessary for the website to function properly. Essential: Required for the website to function properly Preferences: Let us remember your preferred settings Analytics: Help us understand how visitors interact with our website Marketing: Personalize advertisements and measure their performance';

//|=============================================================================================|//
//?                                          TESTS                                              ?//
//|=============================================================================================|//

describe('serializeConsentContent', () => {
    it('reproduces the frozen 2025-10-08 content byte-for-byte', () => {
        expect(serializeConsentContent('2025-10-08')).toBe(
            LEGACY_SERIALIZED_CONTENT
        );
    });

    it('names Google Analytics in the 2026-07-21 content', () => {
        const serialized = serializeConsentContent('2026-07-21');

        expect(serialized).toContain('Google Analytics');
        expect(serialized).toContain('Google LLC');
        expect(serialized).not.toBe(LEGACY_SERIALIZED_CONTENT);
    });

    it('throws for an unknown version', () => {
        expect(() => serializeConsentContent('1970-01-01')).toThrow(
            /No consent content registered/
        );
    });

    it('has content registered for the current CONSENT_VERSION', () => {
        // Guards against bumping CONSENT_VERSION without adding a matching
        // content entry — new consents could then never be hashed.
        expect(() => serializeConsentContent(CONSENT_VERSION)).not.toThrow();
    });
});
