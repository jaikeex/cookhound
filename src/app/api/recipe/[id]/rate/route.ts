import type { NextRequest } from 'next/server';
import { recipeService } from '@/server/services/recipe/service';
import { handleServerError } from '@/server/utils/reqwest';
import { withRateLimit } from '@/server/utils/rate-limit/wrapper';
import { ServerError } from '@/server/error';
import { logRequest, logResponse } from '@/server/logger';
import { RequestContext } from '@/server/utils/reqwest/context';
import { UserRole } from '@/common/types';

//|=============================================================================================|//

/**
 * Handles POST requests to `/api/recipe/{id}/rate` to rate a recipe.
 *
 * ! This endpoint is restricted and only accessible to authenticated users.
 *
 * @returns A JSON response with the recipe data.
 *
 * - 200: Success, with recipe data.
 * - 400: Bad Request, if the recipe ID is not a number.
 * - 401: Unauthorized, if the user is not authenticated.
 * - 429: Too Many Requests, if the user has exceeded the rate limit.
 * - 500: Internal Server Error, if there is another error during the rating process.
 */
async function rateRecipeHandler(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const id = request.nextUrl.pathname.split('/').at(-2);
            const payload = await request.json();

            if (RequestContext.getUserRole() === UserRole.Guest) {
                throw new ServerError('auth.error.unauthorized', 401);
            }

            if (
                !id ||
                isNaN(Number(id)) ||
                !payload?.rating ||
                isNaN(Number(payload.rating))
            ) {
                throw new ServerError('app.error.bad-request', 400);
            }

            await recipeService.rateRecipe(Number(id), payload.rating);

            const response = Response.json({
                message: 'Recipe rated successfully'
            });

            logResponse(response);
            return response;
        } catch (error) {
            return handleServerError(error);
        }
    });
}

export const POST = withRateLimit(rateRecipeHandler, {
    maxRequests: 10,
    windowSizeInSeconds: 60
});
