import { recipeService } from '@/server/services/recipe/service';
import type { NextRequest } from 'next/server';
import { ServerError } from '@/server/error';
import { RequestContext } from '@/server/utils/reqwest/context';
import { logRequest, logResponse } from '@/server/logger';
import { handleServerError } from '@/server/utils/reqwest';

//|=============================================================================================|//

/**
 * Handles GET requests to `/api/recipes/{id}` to fetch a specific recipe.
 *
 * @returns A JSON response with the recipe data.
 *
 * - 200: Success, with recipe data.
 * - 400: Bad Request, if the recipe ID is not a number.
 * - 404: Not Found, if the recipe is not found.
 * - 500: Internal Server Error, if there is another error during the fetching process.
 */
export async function POST(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const recipeId = request.nextUrl.pathname.split('/').at(-2);
            const { userId } = await request.json();

            if (!recipeId || isNaN(Number(recipeId))) {
                throw new ServerError('app.error.bad-request', 400);
            }

            await recipeService.registerRecipeVisit(
                Number(recipeId),
                userId && !isNaN(Number(userId)) ? Number(userId) : null
            );

            const response = Response.json({}, { status: 201 });

            logResponse(response);
            return response;
        } catch (error) {
            return handleServerError(error);
        }
    });
}
