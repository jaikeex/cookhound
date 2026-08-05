import 'server-only';
import { cache } from 'react';
import { hubReads } from '@/server/services';
import type { HubData } from '@/server/services/hub/types';
import type { HubIndexGroup } from '@/common/constants';
import type { RecipeForDisplayDTO } from '@/common/types';

/**
 * Server-side data access for the tag hub pages.
 *
 * Methods stay raw: they rethrow the service's errors and leave render call
 * sites to handle them.
 */
export const hubServerData = {
    /**
     * Resolves a /recepty/[hubSlug] url segment to its tag and recipe count.
     */
    getHub: cache((hubSlug: string): Promise<HubData | null> =>
        hubReads.getHubData(hubSlug)
    ),

    /**
     * Lists one page of the hub's recipes (1-based index).
     */
    listRecipes: cache(
        (tagId: number, page: number): Promise<RecipeForDisplayDTO[]> =>
            hubReads.listRecipes(tagId, page)
    ),

    /**
     * Lists the indexable hubs grouped by category, for the /recepty index.
     */
    getIndexGroups: cache((): Promise<readonly HubIndexGroup[]> =>
        hubReads.getIndexGroups()
    )
};
