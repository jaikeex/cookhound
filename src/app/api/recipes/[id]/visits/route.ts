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
import { ApplicationErrorCode } from '@/server/error/codes';
import { ValidationError } from '@/server/error/server';
import { withRateLimit } from '@/server/utils/rate-limit';

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
 * Handles GET requests to `/api/recipes/{id}/visits` to register a recipe visit.
 *
 * @returns A JSON response with a success message.
 *
 * - 201: Success, with a success message.
 * - 400: Bad Request, if the recipe ID is not a number.
 * - 500: Internal Server Error, if there is another error during the registration process.
 */
async function postHandler(request: NextRequest) {
    const { recipeId } = validateParams(RecipeVisitParamsSchema, {
        recipeId: request.nextUrl.pathname.split('/').at(-2)
    });

    if (!recipeId || isNaN(Number(recipeId))) {
        throw new ValidationError(
            'app.error.bad-request',
            ApplicationErrorCode.MISSING_FIELD
        );
    }

    const rawPayload = await readJson(request);

    const payload = validatePayload(RecipeVisitForCreateSchema, rawPayload);

    const { userId } = payload;

    await recipeService.registerRecipeVisit(
        Number(recipeId),
        userId && !isNaN(Number(userId)) ? Number(userId) : null
    );

    return created({}, { status: 201 });
}

export const POST = makeHandler(
    postHandler,
    withRateLimit({
        maxRequests: 10,
        windowSizeInSeconds: 15
    })
);
