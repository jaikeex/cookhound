'use server';

import { cookies } from 'next/headers';
import {
    CONSENT_COOKIE_MAX_AGE,
    ENV_CONFIG_PUBLIC,
    LOCALE_COOKIE_NAME,
    ONE_YEAR_IN_SECONDS,
    SESSION_COOKIE_NAME
} from '@/common/constants';
import type { CookieConsent } from '@/common/types/cookie-consent';
import { cache } from 'react';
import apiClient from '@/client/request/apiClient';

export const setLocaleCookie = async (locale: string): Promise<void> => {
    const cookieStore = await cookies();

    cookieStore.set(LOCALE_COOKIE_NAME, locale, {
        path: '/',
        maxAge: ONE_YEAR_IN_SECONDS,
        secure: ENV_CONFIG_PUBLIC.ENV === 'production',
        sameSite: 'strict',
        domain: ENV_CONFIG_PUBLIC.COOKIE_DOMAIN
    });
};

export const setConsentCookie = async (
    consent: CookieConsent
): Promise<void> => {
    const cookieStore = await cookies();

    cookieStore.set(
        'cookie_consent',
        encodeURIComponent(JSON.stringify(consent)),
        {
            path: '/',
            maxAge: CONSENT_COOKIE_MAX_AGE,
            secure: ENV_CONFIG_PUBLIC.ENV === 'production',
            sameSite: 'lax',
            domain: ENV_CONFIG_PUBLIC.COOKIE_DOMAIN
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

    return apiClient.auth.getCurrentUser({
        headers: { Cookie: `session=${session}` }
    });
});
