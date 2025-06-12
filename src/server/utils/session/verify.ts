import { JWT_COOKIE_NAME } from '@/common/constants';
import { cookies } from 'next/headers';
import { deleteSession, verifyToken } from '@/server/utils';
import { redirect } from 'next/navigation';
import { UserRole } from '@/common/types';
import db from '@/server/db/model';

type VerifyOptions = {
    role?: UserRole[];
};

export const verifySessionWithRedirect = async (
    options: VerifyOptions = {}
): Promise<boolean | void> => {
    const session = (await cookies()).get(JWT_COOKIE_NAME)?.value;

    if (!session) {
        redirect('/auth/login');
    }

    const payload = verifyToken(session);

    const user = await db.user.getOneById(Number(payload?.id));

    if (!user) {
        deleteSession();
        redirect('/auth/login');
    }

    if (options.role && !options.role.includes(user.role as UserRole)) {
        redirect('/auth/restricted');
    }

    return true;
};

export const verifyIsGuestWithRedirect = async (): Promise<boolean> => {
    const session = (await cookies()).get(JWT_COOKIE_NAME)?.value;

    if (session) {
        redirect('/');
    }

    return true;
};

export const verifyIsGuest = async (): Promise<boolean> => {
    const session = (await cookies()).get(JWT_COOKIE_NAME)?.value;

    if (session) {
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
