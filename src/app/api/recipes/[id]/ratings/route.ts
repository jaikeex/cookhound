import type { NextRequest } from 'next/server';
import { recipeService } from '@/server/services/recipe/service';
import {
    handleServerError,
    validatePayload,
    validateParams
} from '@/server/utils/reqwest';
import { withRateLimit } from '@/server/utils/rate-limit/wrapper';
import { AuthErrorUnauthorized } from '@/server/error';
import { logRequest, logResponse } from '@/server/logger';
import { RequestContext } from '@/server/utils/reqwest/context';
import { UserRole } from '@/common/types';
import { z } from 'zod';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const RatingForCreateSchema = z.strictObject({
    rating: z.coerce.number().min(1).max(5)
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
async function rateRecipeHandler(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            if (RequestContext.getUserRole() === UserRole.Guest) {
                throw new AuthErrorUnauthorized();
            }

            const { recipeId } = validateParams(RatingParamsSchema, {
                recipeId: request.nextUrl.pathname.split('/').at(-2)
            });

            const rawPayload = await request.json();

            const payload = validatePayload(RatingForCreateSchema, rawPayload);

            await recipeService.rateRecipe(Number(recipeId), payload.rating);

            const response = Response.json({
                message: 'Recipe rated successfully'
            });

            logResponse(response);
            return response;
        } catch (error: unknown) {
            return handleServerError(error);
        }
    });
}

export const POST = withRateLimit(rateRecipeHandler, {
    maxRequests: 10,
    windowSizeInSeconds: 60
});
