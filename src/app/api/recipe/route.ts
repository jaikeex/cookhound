import { recipeService } from '@/server/services/recipe/service';
import { handleServerError, verifySession } from '@/server/utils';
import { withRateLimit } from '@/server/utils/rate-limit/wrapper';
import type { NextRequest } from 'next/server';
import { ServerError } from '@/server/error';

/**
 * Handles POST requests to `/api/recipe` to create a new recipe.
 *
 * ! This endpoint is restricted and only accessible to authenticated users.
 *
 * @returns A JSON response indicating the result of the creation operation.
 *
 * - 200: Success, with recipe data.
 * - 401: Unauthorized, if the user is not authenticated.
 * - 500: Internal Server Error, if there is another error during the creation process.
 */
async function createRecipeHandler(request: NextRequest) {
    try {
        const payload = await request.json();

        if (!(await verifySession())) {
            throw new ServerError('auth.error.unauthorized', 401);
        }

        const recipe = await recipeService.createRecipe(payload);

        return Response.json(recipe);
    } catch (error) {
        return handleServerError(error);
    }
}

export const POST = withRateLimit(createRecipeHandler, {
    maxRequests: 20,
    windowSizeInSeconds: 600
});
