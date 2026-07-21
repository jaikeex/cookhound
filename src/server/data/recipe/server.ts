import 'server-only';
import { cache } from 'react';
import { recipeReads } from '@/server/services';
import type { Recipe, RecipeForDisplayDTO } from '@/common/types';

/**
 * Server-side data access for the recipe domain.
 *
 * Unlike userServerData, these reads are CONTEXT-FREE and intentionally do NOT
 * call ensureRenderContext. Recipe reads never touch RequestContext, and the
 * public recipe routes are running under ISR. Building a context reads
 * cookies() & headers(), which would opt the route into dynamic rendering.
 *
 * All reads are wrapped in React cache() so repeated calls with the same args
 * within a single render dedupe to one service/DB hit (e.g. a page and its
 * generateMetadata both reading the same recipe).
 *
 * Methods stay raw: they rethrow the service's errors and leave render call
 * sites to handle them.
 */
export const recipeServerData = {
    getById: cache((id: number): Promise<Recipe> =>
        recipeReads.getRecipeById(id)
    ),

    getByDisplayId: cache((displayId: string): Promise<Recipe> =>
        recipeReads.getRecipeByDisplayId(displayId)
    ),

    getByDisplayIdFresh: cache((displayId: string): Promise<Recipe> =>
        recipeReads.getFreshRecipeByDisplayId(displayId)
    ),

    list: cache(
        (batch: number, perPage: number): Promise<RecipeForDisplayDTO[]> =>
            recipeReads.getFrontPageRecipes(batch, perPage)
    ),

    search: cache(
        (
            query: string,
            batch: number,
            perPage: number
        ): Promise<RecipeForDisplayDTO[]> =>
            recipeReads.searchRecipes(query, batch, perPage)
    )
};
