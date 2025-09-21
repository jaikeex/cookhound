import { recipeService } from '@/server/services/recipe/service';
import type { NextRequest } from 'next/server';
import { NotFoundError, ValidationError } from '@/server/error';
import { makeHandler, ok } from '@/server/utils/reqwest';
import { ApplicationErrorCode } from '@/server/error/codes';

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
async function getHandler(request: NextRequest) {
    const displayId = request.nextUrl.pathname.split('/').pop();

    /**
     * Do NOT validate the params by schema here, requesting a recipe that does
     * not exist should return a 404 error and be handled by the service, not a 400.
     */

    if (!displayId) {
        throw new ValidationError(
            'app.error.bad-request',
            ApplicationErrorCode.MISSING_FIELD
        );
    }

    const recipe = await recipeService.getRecipeByDisplayId(displayId);

    if (!recipe) {
        throw new NotFoundError(
            'app.error.not-found',
            ApplicationErrorCode.RECIPE_NOT_FOUND
        );
    }

    return ok(recipe);
}

export const GET = makeHandler(getHandler);
