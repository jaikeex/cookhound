'use server';

import { cookies } from 'next/headers';
import {
    CONSENT_COOKIE_MAX_AGE,
    LOCALE_COOKIE_NAME,
    ONE_YEAR_IN_SECONDS,
    SESSION_COOKIE_NAME
} from '@/common/constants';
import type { CookieConsent } from '@/common/types/cookie-consent';
import { cache } from 'react';
import { userServerData } from '@/server/data/user/server';
import { setCookie } from '@/server/utils/reqwest/cookies';

export const setLocaleCookie = async (locale: string): Promise<void> => {
    // Shared attributes (path / secure / domain) are applied by setCookie.
    await setCookie(LOCALE_COOKIE_NAME, locale, {
        maxAge: ONE_YEAR_IN_SECONDS,
        sameSite: 'strict'
    });
};

export const setConsentCookie = async (
    consent: CookieConsent
): Promise<void> => {
    await setCookie(
        'cookie_consent',
        encodeURIComponent(JSON.stringify(consent)),
        {
            maxAge: CONSENT_COOKIE_MAX_AGE,
            sameSite: 'lax'
        }
    );
};

/**
 * Cached lookup of the current user.
 */
export const getCurrentUser = cache(async () => {
    const cookieStore = await cookies();

    const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!session) return null;

    return userServerData.getCurrent();
});
