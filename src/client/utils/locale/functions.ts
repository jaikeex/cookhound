import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/common/constants';
import type { Locale } from '@/client/locales';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

/**
 * Extracts the preferred language from an 'Accept-Language' HTTP header.
 * It parses the header value to determine the language preference based on quality values.
 *
 * @param {string | null} headerValue - The value of the 'Accept-Language' HTTP header.
 * @returns {string} The language code with the highest quality or the default locale if none is specified or parsed.
 */
export function extractPreferredLanguage(headerValue: string | null): string {
    if (!headerValue) return DEFAULT_LOCALE;

    // Split the header string into individual language entries
    const languages = headerValue.split(',');

    // Map each language to an object with code and quality
    const parsedLanguages = languages.map((lang) => {
        const parts = lang.split(';');
        const code = parts[0].trim().split('-')[0].toLowerCase();
        const qualityPart = parts[1];
        const quality = qualityPart
            ? parseFloat(qualityPart.split('=')[1])
            : 1.0; // Default quality is 1.0
        return { code, quality };
    });

    // Sort languages by quality, highest first
    parsedLanguages.sort((a, b) => b.quality - a.quality);

    // Return the language code with the highest quality
    return parsedLanguages.length > 0
        ? parsedLanguages[0].code
        : DEFAULT_LOCALE;
}

/**
 * Checks if a given locale string is supported.
 *
 * @param {string} locale - The locale string to check.
 * @returns {boolean} True if the locale is supported, false otherwise.
 * @typePredicate {Locale} - Tells TypeScript to treat the return as a type guard.
 */
export function isSupportedLocale(locale: string): locale is Locale {
    return SUPPORTED_LOCALES.includes(locale as Locale);
}

/**
 * Determines the user's locale by checking cookies and the 'Accept-Language' header.
 * Prioritizes the locale specified in the cookie over the one in the HTTP header.
 *
 * @async
 * @param {ReadonlyRequestCookies} cookies - The cookies associated with the request.
 * @param {Headers} headers - The headers of the incoming request.
 * @returns {Promise<string>} A promise that resolves to the determined locale string, falling back to the default
 *                            locale if not supported.
 */
export async function getUserLocale(
    cookies: ReadonlyRequestCookies,
    headers: Headers
): Promise<Locale> {
    let localeString;

    // Check if the user has a locale cookie
    const localeFromCookie = await cookies.get('locale');

    if (localeFromCookie) {
        // If the user has a locale cookie, use that
        localeString = localeFromCookie.value;
    } else {
        // If the user doesn't have a locale cookie, use the Accept-Language header
        const acceptLanguageHeaderContent = headers.get('accept-language');
        localeString = extractPreferredLanguage(acceptLanguageHeaderContent);
    }

    return isSupportedLocale(localeString) ? localeString : DEFAULT_LOCALE;
}
