import type { NextRequest } from 'next/server';
import { recipeService } from '@/server/services/recipe/service';
import {
    validatePayload,
    validateParams,
    makeHandler,
    ok,
    readJson
} from '@/server/utils/reqwest';
import { withRateLimit } from '@/server/utils/rate-limit/wrapper';
import { withAuth } from '@/server/utils/reqwest';
import { z } from 'zod';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const RatingForCreateSchema = z.strictObject({
    rating: z.coerce.number().min(0).max(5)
});

const RatingParamsSchema = z.strictObject({
    recipeId: z.coerce.number().int().positive()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles POST requests to `/api/recipes/{id}/ratings` to rate a recipe.
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
async function postHandler(request: NextRequest) {
    const { recipeId } = validateParams(RatingParamsSchema, {
        recipeId: request.nextUrl.pathname.split('/').at(-2)
    });

    const rawPayload = await readJson(request);

    const payload = validatePayload(RatingForCreateSchema, rawPayload);

    await recipeService.rateRecipe(Number(recipeId), payload.rating);

    return ok({
        message: 'Recipe rated successfully'
    });
}

export const POST = makeHandler(
    postHandler,
    withAuth,
    withRateLimit({
        maxRequests: 10,
        windowSizeInSeconds: 60
    })
);
