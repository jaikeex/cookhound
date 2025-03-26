'use server';

import { cookies } from 'next/headers';
import { ENV_CONFIG } from '@/client/constants';

export const setLocaleCookie = async (locale: string): Promise<void> => {
    const cookieStore = await cookies();

    cookieStore.set('locale', locale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        secure: true,
        sameSite: 'strict',
        domain: ENV_CONFIG.COOKIE_DOMAIN
    });
};
