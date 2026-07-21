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
    )
};
