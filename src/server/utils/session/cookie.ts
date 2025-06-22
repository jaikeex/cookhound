import { JWT_COOKIE_NAME } from '@/common/constants';
import { ENV_CONFIG_PUBLIC } from '@/common/constants/env';
import { cookies } from 'next/headers';
import { createToken, verifyToken } from './jwt';
import { parse } from 'cookie';
import type { JwtPayload } from 'jsonwebtoken';

//|=============================================================================================|//

//§—————————————————————————————————————————————————————————————————————————————————————————————§//
//§                                        SERVER ONLY                                          §//
///
//# These functions should be used on the server side only.
//#
//# None of these will work on the client OR in the middleware.
//# You have been warned...
///
//§—————————————————————————————————————————————————————————————————————————————————————————————§//

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

export const deleteSession = async () => {
    const cookieStore = await cookies();
    cookieStore.delete(JWT_COOKIE_NAME);
};

export const updateSession = async () => {
    const session = (await cookies()).get(JWT_COOKIE_NAME)?.value;

    if (!session) return;

    const cookie = parse(session);

    if (!cookie.maxAge) {
        await createSession(session, false);
        return;
    }

    const payload = verifyToken(session);

    const newToken = createToken({
        id: payload.id,
        role: payload.role
    });

    await createSession(newToken, true);
};

export const parseSession = async (): Promise<JwtPayload | null> => {
    try {
        const session = (await cookies()).get(JWT_COOKIE_NAME)?.value;

        if (!session) {
            return null;
        }

        const payload = verifyToken(session);

        if (!payload?.id || !payload?.role) {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
};
