import { JWT_COOKIE_NAME } from '@/common/constants';
import { cookies } from 'next/headers';
import { verifyToken } from '@/server/utils';
import { UserRole } from '@/common/types';
import db from '@/server/db/model';

//§—————————————————————————————————————————————————————————————————————————————————————————————§//
//§                                      UNUSED FUNCTIONS                                       §//
///
//# Only verifySession() and verifyIsGuest() are currently in active use. The reset is kept
//# here for reference and likely won't be needed in the future.
///
//§—————————————————————————————————————————————————————————————————————————————————————————————§//
//§                                        SERVER ONLY                                          §//
///
//# These functions should be used on the server side only.
//#
//# None of these will work on the client OR in the middleware.
//# You have been warned...
///
//§—————————————————————————————————————————————————————————————————————————————————————————————§//

export const verifySession = async (): Promise<boolean> => {
    const session = (await cookies()).get(JWT_COOKIE_NAME)?.value;

    if (!session) {
        return false;
    }

    const payload = verifyToken(session);

    const user = await db.user.getOneById(Number(payload?.id));

    if (!user) {
        return false;
    }

    return true;
};

export const verifyIsGuest = async (): Promise<boolean> => {
    const session = (await cookies()).get(JWT_COOKIE_NAME)?.value;

    if (!session) {
        return true;
    }

    const payload = verifyToken(session);

    const user = await db.user.getOneById(Number(payload?.id));

    if (user) {
        return false;
    }

    return true;
};

export const verifyIsUser = async (): Promise<boolean> => {
    const session = (await cookies()).get(JWT_COOKIE_NAME)?.value;

    if (!session) {
        return false;
    }

    const payload = verifyToken(session);

    const user = await db.user.getOneById(Number(payload?.id));

    if (!user) {
        return false;
    }

    if (user.role !== UserRole.User) {
        return false;
    }

    return true;
};

export const verifyIsAdmin = async (): Promise<boolean> => {
    const session = (await cookies()).get(JWT_COOKIE_NAME)?.value;

    if (!session) {
        return false;
    }

    const payload = verifyToken(session);

    const user = await db.user.getOneById(Number(payload?.id));

    if (!user) {
        return false;
    }

    if (user.role !== UserRole.Admin) {
        return false;
    }

    return true;
};
