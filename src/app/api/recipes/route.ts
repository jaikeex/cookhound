import { logRequest, logResponse } from '@/server/logger';
import { recipeService } from '@/server/services/recipe/service';
import { RequestContext } from '@/server/utils/reqwest/context';
import { handleServerError } from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { UserRole } from '@/common/types';
import { ServerError } from '@/server/error';
import { withRateLimit } from '@/server/utils/rate-limit';
import type { Locale } from '@/client/locales';

//|=============================================================================================|//

/**
 * Handles GET requests to `/api/recipes` to fetch a paginated list of recipes.
 *
 * @param request The incoming HTTP request.
 * @returns A JSON response containing the paginated list of recipes.
 */
export async function GET(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const { searchParams } = new URL(request.url);

            const batch = Number(searchParams.get('batch'));
            const perPage = Number(searchParams.get('perPage'));
            const language = searchParams.get('language');

            if (!language || !batch || !perPage) {
                throw new ServerError('app.error.bad-request', 400);
            }

            const recipes = await recipeService.getFrontPageRecipes(
                language as Locale,
                batch,
                perPage
            );

            const response = NextResponse.json(recipes);

            logResponse(response);
            return response;
        } catch (error: any) {
            return handleServerError(error);
        }
    });
}

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

            const response = Response.json(recipe, { status: 201 });

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
