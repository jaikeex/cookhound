import { recipeService } from '@/server/services/recipe/service';
import type { NextRequest } from 'next/server';
import {
    validatePayload,
    validateParams,
    makeHandler,
    created,
    readJson
} from '@/server/utils/reqwest';
import { z } from 'zod';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const RecipeVisitForCreateSchema = z.strictObject({
    userId: z.coerce.number().int().positive().optional().nullable()
});

const RecipeVisitParamsSchema = z.strictObject({
    recipeId: z.coerce.number().int().positive()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
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
export async function postHandler(request: NextRequest) {
    const { recipeId } = validateParams(RecipeVisitParamsSchema, {
        recipeId: request.nextUrl.pathname.split('/').at(-2)
    });

    const rawPayload = await readJson(request);

    const payload = validatePayload(RecipeVisitForCreateSchema, rawPayload);

    const { userId } = payload;

    await recipeService.registerRecipeVisit(
        Number(recipeId),
        userId && !isNaN(Number(userId)) ? Number(userId) : null
    );

    return created({}, { status: 201 });
}

export const POST = makeHandler(postHandler);
