import type { NextRequest } from 'next/server';
import { recipeService } from '@/server/services/recipe/service';
import { z } from 'zod';
import { validateQuery } from '@/server/utils/reqwest';
import { ApplicationErrorCode } from '@/server/error/codes';
import { ValidationError } from '@/server/error/server';
import { makeHandler, ok } from '@/server/utils/reqwest';
import { SUPPORTED_LOCALES } from '@/common/constants';
import {
    registerRouteDocs,
    RecipeDisplayResponseSchema
} from '@/server/utils/api-docs';
import { AuthLevel } from '@/common/types';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const SearchRecipesByUserSchema = z.strictObject({
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
 * Handles GET requests to `/api/recipes/user/{userId}/search` to search for recipes by user.
 *
 * @returns A JSON response containing the search results.
 *
 * - 200: Success, with search results.
 * - 400: Bad Request, if the user ID is not a number.
 * - 500: Internal Server Error, if there is another error during the fetching process.
 */
async function getHandler(request: NextRequest) {
    const userId = request.nextUrl.pathname.split('/').at(-2);

    if (!userId || isNaN(Number(userId))) {
        throw new ValidationError(
            'app.error.bad-request',
            ApplicationErrorCode.MISSING_FIELD
        );
    }

    const payload = validateQuery(SearchRecipesByUserSchema, request.nextUrl);

    const { query, language, perPage, batch } = payload;

    const recipes = await recipeService.searchUserRecipes(
        Number(userId),
        query,
        language,
        batch,
        perPage
    );

    return ok(recipes);
}

export const GET = makeHandler(getHandler);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/recipes/user/{userId}/search', {
    category: 'Recipes',
    subcategory: 'By User',
    GET: {
        summary: 'Search recipes by a specific user.',
        description: `Full-text search scoped to a single user's
            recipes. Uses Typesense with database fallback.`,
        auth: AuthLevel.PUBLIC,
        querySchema: SearchRecipesByUserSchema,
        clientUsage: [
            {
                apiClient: 'apiClient.recipe.searchUserRecipes',
                hook: 'chqc.recipe.useUserSearchRecipes'
            },
            {
                apiClient: 'apiClient.recipe.searchUserRecipes',
                hook: 'chqc.recipe.useUserSearchRecipesInfinite'
            }
        ],
        responses: {
            200: {
                description: 'Search results',
                schema: z.array(RecipeDisplayResponseSchema)
            }
        }
    }
});
