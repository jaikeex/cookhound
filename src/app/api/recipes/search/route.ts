import type { NextRequest } from 'next/server';
import { recipeService } from '@/server/services/recipe/service';
import { z } from 'zod';
import { validateQuery } from '@/server/utils/reqwest';
import { makeHandler, ok } from '@/server/utils/reqwest';
import { SUPPORTED_LOCALES } from '@/common/constants';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const SearchRecipesSchema = z.strictObject({
    query: z.string().trim().min(1).max(100),
    language: z.enum(SUPPORTED_LOCALES, {
        error: () => 'Language must be supported'
    }),
    perPage: z.coerce.number().int().positive(),
    batch: z.coerce.number().int().positive()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles GET requests to `/api/recipes/search` to search for recipes.
 *
 * @returns A JSON response containing the search results.
 */
async function getHandler(request: NextRequest) {
    const payload = validateQuery(SearchRecipesSchema, request.nextUrl);

    const { query, language, perPage, batch } = payload;

    const recipes = await recipeService.searchRecipes(
        query,
        language,
        batch,
        perPage
    );

    return ok(recipes);
}
export const GET = makeHandler(getHandler);
