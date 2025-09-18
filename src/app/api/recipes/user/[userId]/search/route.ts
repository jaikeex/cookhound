import { RequestContext } from '@/server/utils/reqwest/context';
import { logRequest, logResponse } from '@/server/logger';
import { handleServerError } from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { recipeService } from '@/server/services/recipe/service';
import type { Locale } from '@/client/locales';
import { z } from 'zod';
import { validateQuery } from '@/server/utils/reqwest/validators';
import { ApplicationErrorCode } from '@/server/error/codes';
import { ValidationError } from '@/server/error/server';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const SearchRecipesByUserSchema = z.strictObject({
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
 * Handles GET requests to `/api/recipes/user/{userId}/search` to search for recipes by user.
 *
 * @returns A JSON response containing the search results.
 *
 * - 200: Success, with search results.
 * - 400: Bad Request, if the user ID is not a number.
 * - 500: Internal Server Error, if there is another error during the fetching process.
 */
export async function GET(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const userId = request.nextUrl.pathname.split('/').at(-2);

            if (!userId || isNaN(Number(userId))) {
                throw new ValidationError(
                    'app.error.bad-request',
                    ApplicationErrorCode.MISSING_FIELD
                );
            }

            const payload = validateQuery(
                SearchRecipesByUserSchema,
                request.nextUrl
            );

            const { query, language, perPage, batch } = payload;

            const recipes = await recipeService.searchUserRecipes(
                Number(userId),
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
