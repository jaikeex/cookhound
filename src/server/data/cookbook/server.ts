import 'server-only';
import { cache } from 'react';
import { cookbookReads } from '@/server/services';
import type { Cookbook } from '@/common/types';
import { reviveCookbookDates } from '@/client/data/cookbook/revive';
import { ensureRenderContext } from '@/server/data/runtime/ensureContext';

/**
 * Server-side data access for the cookbook domain.
 *
 * Methods stay raw: they rethrow the service's errors and leave render call
 * sites to handle them.
 */
export const cookbookServerData = {
    getByDisplayId: cache((displayId: string): Promise<Cookbook> =>
        ensureRenderContext(() =>
            cookbookReads.getCookbookByDisplayId(displayId)
        ).then(reviveCookbookDates)
    ),

    /**
     * The cookbooks of one owner as the current viewer is allowed to see them,
     * for seeding the profile cookbooks tab.
     *
     * Context-bound on purpose: the service filters the list through
     * canListCookbook, which reads the viewer from the request context. Without
     * the context the render would silently produce the anonymous view.
     *
     * § The result is therefore viewer-specific and must only be rendered on a
     * § dynamic route. Do not use this on a page that is statically generated or cached.
     */
    listByOwner: cache((ownerId: number): Promise<Cookbook[]> =>
        ensureRenderContext(() =>
            cookbookReads.getCookbooksByOwnerId(ownerId)
        ).then((cookbooks) => cookbooks.map(reviveCookbookDates))
    )
};
