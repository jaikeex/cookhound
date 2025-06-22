import { recipeService } from '@/server/services/recipe/service';
import { handleServerError } from '@/server/utils/reqwest';
import { withRateLimit } from '@/server/utils/rate-limit/wrapper';
import type { NextRequest } from 'next/server';
import { ServerError } from '@/server/error';
import { logRequest, logResponse } from '@/server/logger';
import { RequestContext } from '@/server/utils/reqwest/context';
import { UserRole } from '@/common/types';

//|=============================================================================================|//

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
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            if (RequestContext.getUserRole() === UserRole.Guest) {
                throw new ServerError('auth.error.unauthorized', 401);
            }

            const payload = await request.json();

            const recipe = await recipeService.createRecipe(payload);

            const response = Response.json(recipe);

            logResponse(response);
            return response;
        } catch (error) {
            return handleServerError(error);
        }
    });
}

export const POST = withRateLimit(createRecipeHandler, {
    maxRequests: 20,
    windowSizeInSeconds: 600
});
