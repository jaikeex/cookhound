import { ENV_CONFIG_PUBLIC } from '@/common/constants/env';
import { SESSION_COOKIE_NAME } from '@/common/constants/general';
import { ONE_MONTH_IN_SECONDS } from '@/common/constants/time';
import { serialize } from 'cookie';
import { mutableCookies } from '@/server/utils/reqwest/cookies';

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
    const maxAge = keepLoggedIn ? ONE_MONTH_IN_SECONDS : undefined;
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
    // mutableCookies() makes this a no-op during an RSC render (where cookie
    // mutation would throw) and a real delete on a route/action origin.
    //
    // Call this only from a route/action origin or from a render
    // wrapped in ensureRenderContext. The render no-op only engages when an
    // origin 'render' context is active; from plain render code with no context
    // getOrigin() defaults to 'route', the real store is used, and the delete
    // throws. search for mutableCookies and read the full reasoning.
    const cookieStore = await mutableCookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
};
