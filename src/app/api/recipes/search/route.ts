import { RequestContext } from '@/server/utils/reqwest/context';
import { logRequest, logResponse } from '@/server/logger';
import { handleServerError } from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { recipeService } from '@/server/services/recipe/service';
import type { Locale } from '@/client/locales';
import { z } from 'zod';
import { validateQuery } from '@/server/utils/reqwest/validators';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const SearchRecipesSchema = z.strictObject({
    query: z.string().trim().min(1).max(100),
    language: z.enum(['en', 'cs'], {
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
export async function GET(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const payload = validateQuery(SearchRecipesSchema, request.nextUrl);

            const { query, language, perPage, batch } = payload;

            const recipes = await recipeService.searchRecipes(
                query,
                language as Locale,
                batch,
                perPage
            );

            const response = Response.json(recipes);

            logResponse(response);
            return response;
        } catch (error: unknown) {
            return handleServerError(error);
        }
    });
}
