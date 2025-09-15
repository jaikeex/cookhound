'use server';

import { cookies } from 'next/headers';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';

export const setLocaleCookie = async (locale: string): Promise<void> => {
    const cookieStore = await cookies();

    cookieStore.set('locale', locale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        secure: ENV_CONFIG_PUBLIC.ENV === 'production',
        sameSite: 'strict',
        domain: ENV_CONFIG_PUBLIC.COOKIE_DOMAIN
    });
};
