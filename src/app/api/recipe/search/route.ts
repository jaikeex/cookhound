import { RequestContext } from '@/server/utils/reqwest/context';
import { logRequest, logResponse } from '@/server/logger';
import { handleServerError } from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { ServerError } from '@/server/error';
import { recipeService } from '@/server/services/recipe/service';
import { withRateLimit } from '@/server/utils/rate-limit/wrapper';
import type { Locale } from '@/client/locales';

//|=============================================================================================|//

/**
 * Handles GET requests to `/api/recipe/search` to search for recipes.
 *
 * @returns A JSON response containing the search results.
 */
async function searchRecipesHandler(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const { searchParams } = new URL(request.url);

            const query = searchParams.get('query');
            const language = searchParams.get('language');
            const perPage = Number(searchParams.get('perPage'));
            const batch = Number(searchParams.get('batch'));

            if (!query || !language || !perPage || !batch) {
                throw new ServerError('app.error.bad-request', 400);
            }

            const recipes = await recipeService.searchRecipes(
                query,
                language as Locale,
                batch,
                perPage
            );

            const response = Response.json(recipes);

            logResponse(response);
            return response;
        } catch (error) {
            return handleServerError(error);
        }
    });
}

export const GET = withRateLimit(searchRecipesHandler, {
    maxRequests: 5,
    windowSizeInSeconds: 60
});
