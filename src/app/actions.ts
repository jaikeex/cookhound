'use server';

import { cookies } from 'next/headers';
import {
    CONSENT_COOKIE_MAX_AGE,
    ENV_CONFIG_PUBLIC,
    ONE_YEAR_IN_SECONDS
} from '@/common/constants';
import type { CookieConsent } from '@/common/types/cookie-consent';

export const setLocaleCookie = async (locale: string): Promise<void> => {
    const cookieStore = await cookies();

    cookieStore.set('locale', locale, {
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
