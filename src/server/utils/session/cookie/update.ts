import { cookies } from 'next/headers';
import { parse } from 'cookie';
import { createSession } from './create';
import { createToken, verifyToken } from '@/server/utils';
import { JWT_COOKIE_NAME } from '@/common/constants';

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
