import { ENV_CONFIG_PUBLIC } from '@/common/constants/env';
import { SESSION_COOKIE_NAME } from '@/common/constants/general';
import { cookies } from 'next/headers';
import { serialize } from 'cookie';

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

export const createSessionCookie = (
    sessionId: string,
    keepLoggedIn: boolean
) => {
    const maxAge = keepLoggedIn ? 60 * 60 * 24 * 30 : undefined;
    const secure = ENV_CONFIG_PUBLIC.ENV !== 'development';

    return serialize(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        secure,
        maxAge
    });
};

export const deleteSessionCookie = async () => {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
};
