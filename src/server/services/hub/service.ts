import { recipeTagService } from '@/server/services/recipe-tag/service';
import { recipeFilterService } from '@/server/services/recipe-filter/service';
import { resolveHubSlug, HUB_PAGE_SIZE } from '@/common/constants';
import { LogServiceMethod } from '@/server/logger';
import type { RecipeForDisplayDTO } from '@/common/types';
import type { HubData } from './types';

//|=============================================================================================|//

const LOG_CONTEXT = 'hub-service';

/**
 * Composes tag lookup and recipe filtering into the read model backing the
 * tag hub pages.
 */
class HubService {
    static readonly LOG_CONTEXT = LOG_CONTEXT;

    /**
     * Resolves a /recepty/[hubSlug] url segment to its tag and recipe count.
     */
    @LogServiceMethod({ names: ['hubSlug'] })
    async getHubData(hubSlug: string): Promise<HubData | null> {
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
            pageCount: this.pageCountFor(recipeCount)
        };
    }

    /**
     * Lists one page of a hub's recipes (1-based index).
     */
    @LogServiceMethod({ names: ['tagId', 'page'] })
    async listRecipes(
        tagId: number,
        page: number
    ): Promise<RecipeForDisplayDTO[]> {
        return recipeFilterService.filterRecipes(
            { tags: [tagId] },
            page,
            HUB_PAGE_SIZE
        );
    }

    /**
     * Derives the paginated depth for a recipe count, always at least one page
     * and capped at the filter service's pagination limit.
     */
    private pageCountFor(recipeCount: number): number {
        return Math.min(
            recipeFilterService.MAX_BATCHES,
            Math.max(1, Math.ceil(recipeCount / HUB_PAGE_SIZE))
        );
    }
}

/**
 * Render-safe subset of HubService. serverData access points and rsc render paths
 * depend on this so that only allowed methods are in scope, and side effects
 * cannot be called by mistake.
 */
export interface HubReads {
    getHubData(hubSlug: string): Promise<HubData | null>;
    listRecipes(tagId: number, page: number): Promise<RecipeForDisplayDTO[]>;
}

export const hubService = new HubService();
export const hubReads: HubReads = hubService;
