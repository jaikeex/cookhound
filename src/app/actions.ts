'use server';

import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@/common/constants';
import { cache } from 'react';
import { serverData } from '@/server/data';

/**
 * Cached lookup of the current user.
 */
export const getCurrentUser = cache(async () => {
    const cookieStore = await cookies();

    const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!session) return null;

    return serverData.user.getCurrent();
});
