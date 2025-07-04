import { cookies } from 'next/headers';
import { sessions } from '@/server/utils/session';
import type { ServerSession } from '@/server/utils/session';
import { SESSION_COOKIE_NAME } from '@/common/constants/general';

//§—————————————————————————————————————————————————————————————————————————————————————————————§//
//§                                        SERVER ONLY                                          §//
///
//# These functions should be used on the server side only.
//#
//# None of these will work on the client OR in the middleware.
//# You have been warned...
///
//§—————————————————————————————————————————————————————————————————————————————————————————————§//

type VerifyResult =
    | {
          isLoggedIn: true;
          session: ServerSession;
      }
    | {
          isLoggedIn: false;
          session: null;
      };

export const verifySessionFromCookie = async (): Promise<VerifyResult> => {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) {
        return { isLoggedIn: false, session: null };
    }

    const session = await sessions.validateSession(sessionId);

    if (!session) {
        return { isLoggedIn: false, session: null };
    }

    return { isLoggedIn: true, session };
};
