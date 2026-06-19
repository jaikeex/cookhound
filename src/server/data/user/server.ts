import 'server-only';
import { cache } from 'react';
import { authReads, userReads } from '@/server/services';
import type { User } from '@/common/types';
import { reviveUserDates } from '@/client/data/user/revive';
import { ensureRenderContext } from '@/server/data/runtime/ensureContext';

/**
 * Server-side data access for the user domain.
 *
 * Lets server components call the user & auth services directly. ensureRenderContext
 * guarantees a populated RequestContext so visibility groups and auth guards behave
 * correctly during a render.
 *
 * Beyond date revival, methods stay raw: they rethrow the service's errors and leave
 * render call sites to handle them.
 */
export const userServerData = {
    getById: cache(
        (id: number): Promise<User> =>
            ensureRenderContext(() => userReads.getUserById(id)).then(
                reviveUserDates
            )
    ),

    getCurrent: cache(
        (): Promise<User> =>
            ensureRenderContext(() => authReads.getAuthenticatedUser()).then(
                reviveUserDates
            )
    )
};
