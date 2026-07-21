import 'server-only';
import { cache } from 'react';
import { authReads, userReads } from '@/server/services';
import type { User, ShoppingListDTO } from '@/common/types';
import { reviveUserDates } from '@/client/data/user/revive';
import { ensureRenderContext } from '@/server/data/runtime/ensureContext';

/**
 * Server-side data access for the user domain.
 *
 * Beyond date revival, methods stay raw: they rethrow the service's errors and leave
 * render call sites to handle them.
 */
export const userServerData = {
    getById: cache((id: number): Promise<User> =>
        ensureRenderContext(() => userReads.getUserById(id)).then(
            reviveUserDates
        )
    ),

    getByIdPublic: cache((id: number): Promise<User> =>
        userReads.getUserById(id).then(reviveUserDates)
    ),

    getCurrent: cache((): Promise<User> =>
        ensureRenderContext(() => authReads.getAuthenticatedUser()).then(
            reviveUserDates
        )
    ),

    getShoppingList: cache((userId: number): Promise<ShoppingListDTO[]> =>
        ensureRenderContext(() => userReads.getShoppingList(userId))
    )
};
