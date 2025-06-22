import { JWT_COOKIE_NAME } from '@/common/constants';
import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import { UserRole } from '@/common/types';
import db from '@/server/db/model';

//§—————————————————————————————————————————————————————————————————————————————————————————————§//
//§                                      UNUSED FUNCTIONS                                       §//
///
//# None of these functions is currently in active use. They are kept
//# here for reference and likely can be freely removed in the future.
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
