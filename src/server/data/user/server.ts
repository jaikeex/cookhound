import 'server-only';
import { cache } from 'react';
import { authReads, userReads } from '@/server/services';
import type { UserDTO } from '@/common/types';
import { ensureRenderContext } from '@/server/data/runtime/ensureContext';

/**
 * Server-side data access for the user domain.
 *
 * Lets server components call the user & auth services directly. ensureRenderContext
 * guarantees a populated RequestContext so visibility groups and auth guards behave
 * correctly during a render.
 *
 * Methods are intended to be as raw as possible: they return the service's return
 * and rethrow the service's erros. Render call sites are responsible for handling everything relevant.
 */
export const userServerData = {
    getById: cache(
        (id: number): Promise<UserDTO> =>
            ensureRenderContext(() => userReads.getUserById(id))
    ),

    getCurrent: cache(
        (): Promise<UserDTO> =>
            ensureRenderContext(() => authReads.getAuthenticatedUser())
    )
};
