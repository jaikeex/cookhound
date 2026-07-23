import 'server-only';
import { cache } from 'react';
import { recipeReads } from '@/server/services';
import type { Recipe, RecipeForDisplayDTO } from '@/common/types';

/**
 * Server-side data access for the recipe domain.
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

    getByLegacyDisplayId: cache(
        (
            legacyDisplayId: string
        ): Promise<{ displayId: string; title: string } | null> =>
            recipeReads.getByLegacyDisplayId(legacyDisplayId)
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
