import { JWT_COOKIE_NAME } from '@/common/constants';
import { ENV_CONFIG_PUBLIC } from '@/common/constants/env';
import { cookies } from 'next/headers';

export const createSession = async (token: string, keepLoggedIn: boolean) => {
    const maxAge = keepLoggedIn ? 60 * 60 * 24 * 30 : undefined;
    const secure = ENV_CONFIG_PUBLIC.ENV !== 'development';

    const cookie = {
        httpOnly: true,
        sameSite: 'strict' as const,
        path: '/',
        secure,
        maxAge
    };

    const cookieStore = await cookies();
    cookieStore.set(JWT_COOKIE_NAME, token, cookie);
};
