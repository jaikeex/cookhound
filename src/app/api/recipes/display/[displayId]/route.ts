import { recipeService } from '@/server/services/recipe/service';
import type { NextRequest } from 'next/server';
import { ServerError } from '@/server/error';
import { RequestContext } from '@/server/utils/reqwest/context';
import { logRequest, logResponse } from '@/server/logger';
import { handleServerError } from '@/server/utils/reqwest';

//|=============================================================================================|//

/**
 * Handles GET requests to `/api/recipes/display/{displayId}` to fetch a specific recipe.
 *
 * @returns A JSON response with the recipe data.
 *
 * - 200: Success, with recipe data.
 * - 400: Bad Request, if the recipe ID is not a number.
 * - 404: Not Found, if the recipe is not found.
 * - 500: Internal Server Error, if there is another error during the fetching process.
 */
export async function GET(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const displayId = request.nextUrl.pathname.split('/').pop();

            /**
             * Do NOT validate the params by schema here, requesting a recipe that does
             * not exist should return a 404 error and be handled by the service, not a 400.
             */

            if (!displayId) {
                throw new ServerError('app.error.bad-request', 400);
            }

            const recipe = await recipeService.getRecipeByDisplayId(displayId);

            if (!recipe) {
                throw new ServerError('app.error.not-found', 404);
            }

            const response = Response.json(recipe);

            logResponse(response);
            return response;
        } catch (error: unknown) {
            return handleServerError(error);
        }
    });
}
