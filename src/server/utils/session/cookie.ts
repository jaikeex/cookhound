import { ENV_CONFIG_PUBLIC } from '@/common/constants/env';
import {
    SESSION_COOKIE_NAME,
    SESSION_HINT_COOKIE_NAME
} from '@/common/constants/general';
import { ONE_MONTH_IN_SECONDS } from '@/common/constants/time';
import { serialize } from 'cookie';
import { deleteCookie } from '@/server/utils/reqwest/cookies';

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

export const createSessionCookieHeaders = (
    sessionId: string,
    keepLoggedIn: boolean
): Headers => {
    const maxAge = keepLoggedIn ? ONE_MONTH_IN_SECONDS : undefined;
    const secure = ENV_CONFIG_PUBLIC.ENV !== 'development';

    const sessionCookie = serialize(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        domain: ENV_CONFIG_PUBLIC.COOKIE_DOMAIN,
        secure,
        maxAge
    });

    const hintCookie = serialize(SESSION_HINT_COOKIE_NAME, '1', {
        httpOnly: false,
        sameSite: 'strict',
        path: '/',
        domain: ENV_CONFIG_PUBLIC.COOKIE_DOMAIN,
        secure,
        maxAge
    });

    const headers = new Headers();
    headers.append('Set-Cookie', sessionCookie);
    headers.append('Set-Cookie', hintCookie);

    return headers;
};

export const deleteSessionCookie = async () => {
    await deleteCookie(SESSION_COOKIE_NAME);
    await deleteCookie(SESSION_HINT_COOKIE_NAME);
};
