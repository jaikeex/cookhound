import { JWT_COOKIE_NAME } from '@/common/constants';
import { cookies } from 'next/headers';
import { deleteSession, verifyToken } from '@/server/utils';
import { redirect } from 'next/navigation';
import { UserRole } from '@/common/types';
import db from '@/server/db/model';

//§—————————————————————————————————————————————————————————————————————————————————————————————§//
//§                                      UNUSED FUNCTIONS                                       §//
/**
 *# Only verifySession() and verifyIsGuest() are currently in active use. The reset is kept
 *# here for reference and likely won't be needed in the future.
 */
//§—————————————————————————————————————————————————————————————————————————————————————————————§//
//§                                        SERVER ONLY                                          §//
/**
 *# These functions should be used on the server side only.
 *#
 *# None of these will work on the client OR in the middleware.
 *# You have been warned...
 */
//§—————————————————————————————————————————————————————————————————————————————————————————————§//

type VerifyOptions = {
    role?: UserRole[];
};

export const verifySessionWithRedirect = async (
    options: VerifyOptions = {}
): Promise<boolean | void> => {
    const session = (await cookies()).get(JWT_COOKIE_NAME)?.value;

    if (!session) {
        redirect('/auth/restricted?anonymous=true');
    }

    const payload = verifyToken(session);

    const user = await db.user.getOneById(Number(payload?.id));

    if (!user) {
        deleteSession();
        redirect('/auth/restricted?anonymous=true');
    }

    if (options.role && !options.role.includes(user.role as UserRole)) {
        redirect('/auth/restricted');
    }

    return true;
};

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

export const verifyIsGuestWithRedirect = async (): Promise<boolean> => {
    const session = (await cookies()).get(JWT_COOKIE_NAME)?.value;

    if (!session) {
        return true;
    }

    const payload = verifyToken(session);

    const user = await db.user.getOneById(Number(payload?.id));

    if (user) {
        redirect('/');
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
