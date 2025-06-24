import { RequestContext } from '@/server/utils/reqwest/context';
import { logRequest, logResponse } from '@/server/logger';
import { handleServerError } from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { ServerError } from '@/server/error';
import { recipeService } from '@/server/services/recipe/service';
import type { Locale } from '@/client/locales';

//|=============================================================================================|//

/**
 * Handles GET requests to `/api/recipe/search` to search for recipes.
 *
 * @returns A JSON response containing the search results.
 */
export async function GET(request: NextRequest) {
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
