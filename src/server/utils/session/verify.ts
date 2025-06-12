import { JWT_COOKIE_NAME } from '@/common/constants';
import { cookies } from 'next/headers';
import { verifyToken } from '@/server/utils';
import { redirect } from 'next/navigation';
import type { UserRole } from '@/common/types';

type VerifyOptions = {
    role?: UserRole[];
};

export const verifySession = async (
    options: VerifyOptions = {}
): Promise<boolean | void> => {
    const session = (await cookies()).get(JWT_COOKIE_NAME)?.value;

    if (!session) {
        redirect('/auth/login');
    }

    const payload = verifyToken(session);

    if (!payload?.id || !payload?.role) {
        redirect('/auth/login');
    }

    if (options.role && !options.role.includes(payload.role)) {
        redirect('/auth/login');
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
