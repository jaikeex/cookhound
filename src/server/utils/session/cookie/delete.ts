import { JWT_COOKIE_NAME } from '@/common/constants';
import { cookies } from 'next/headers';

export const deleteSession = async () => {
    const cookieStore = await cookies();
    cookieStore.delete(JWT_COOKIE_NAME);
};
