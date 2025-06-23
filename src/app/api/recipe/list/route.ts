import { logRequest, logResponse } from '@/server/logger';
import { recipeService } from '@/server/services/recipe/service';
import { RequestContext } from '@/server/utils/reqwest/context';
import { handleServerError } from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

//|=============================================================================================|//

/**
 * Handles GET requests to `/api/recipe/list` to fetch a paginated list of recipes.
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

            const recipes = await recipeService.getFrontPageRecipes(
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
