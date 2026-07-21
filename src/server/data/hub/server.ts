import 'server-only';
import { cache } from 'react';
import { recipeFilterService, recipeTagService } from '@/server/services';
import { resolveHubSlug, HUB_PAGE_SIZE } from '@/common/constants';
import type { HubDbSlug } from '@/common/constants';
import type { RecipeForDisplayDTO, RecipeTagDTO } from '@/common/types';

/**
 * Server-side data access for the tag hub pages (/recepty/<hubSlug>).
 *
 * Like recipeServerData, these reads are CONTEXT-FREE - the hub routes run
 * under ISR. All reads are wrapped in React cache() so a page and its
 * generateMetadata dedupe to one hit.
 */

const HUB_MAX_PAGES = recipeFilterService.MAX_BATCHES;

export type HubData = Readonly<{
    dbSlug: HubDbSlug;
    tag: RecipeTagDTO;
    recipeCount: number;
    pageCount: number;
}>;

export const hubServerData = {
    /**
     * Resolves a /recepty/[hubSlug] url segment to its tag and recipe count.
     */
    getHub: cache(async (hubSlug: string): Promise<HubData | null> => {
        const dbSlug = resolveHubSlug(hubSlug);

        if (!dbSlug) {
            return null;
        }

        const tag = await recipeTagService.getBySlug(dbSlug);

        if (!tag) {
            return null;
        }

        const recipeCount = await recipeFilterService.countRecipes({
            tags: [tag.id]
        });

        return {
            dbSlug,
            tag,
            recipeCount,
            pageCount: Math.min(
                HUB_MAX_PAGES,
                Math.max(1, Math.ceil(recipeCount / HUB_PAGE_SIZE))
            )
        };
    }),

    /**
     * Lists one page of the hub's recipes (1-based index).
     */
    listRecipes: cache(
        (tagId: number, page: number): Promise<RecipeForDisplayDTO[]> =>
            recipeFilterService.filterRecipes(
                { tags: [tagId] },
                page,
                HUB_PAGE_SIZE
            )
    )
};
