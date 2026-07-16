import { recipeService } from '@/server/services/recipe/service';
import type { NextRequest } from 'next/server';
import {
    validatePayload,
    validateParams,
    makeHandler,
    created,
    readJson
} from '@/server/utils/reqwest';
import { RequestContext } from '@/server/utils/reqwest/context';
import { z } from 'zod';
import { withRateLimit } from '@/server/utils/rate-limit';
import { registerRouteDocs } from '@/server/utils/api-docs/registry';
import { AuthLevel } from '@/common/types';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const RecipeVisitForCreateSchema = z.strictObject({});

const RecipeVisitParamsSchema = z.strictObject({
    recipeId: z.coerce.number().int().positive()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles POST requests to `/api/recipes/{id}/visits` to register a recipe visit.
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

    const rawPayload = await readJson(request);
    validatePayload(RecipeVisitForCreateSchema, rawPayload);

    const userId = RequestContext.getUserId();

    await recipeService.registerRecipeVisit(Number(recipeId), userId);

    return created({}, { status: 201 });
}

export const POST = makeHandler(
    postHandler,
    withRateLimit({
        maxRequests: 10,
        windowSizeInSeconds: 15
    })
);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/recipes/{id}/visits', {
    category: 'Recipes',
    subcategory: 'Ratings & Visits',
    POST: {
        summary: 'Record a recipe visit.',
        description: `Updates the authenticated user's last-viewed history when a session is present; records an anonymous view-count increment otherwise.`,
        auth: AuthLevel.PUBLIC,
        rateLimit: { maxRequests: 10, windowSizeInSeconds: 15 },
        bodySchema: RecipeVisitForCreateSchema,
        clientUsage: [
            {
                apiClient: 'apiClient.recipe.registerRecipeVisit',
                hook: 'chqc.recipe.useRegisterRecipeVisit'
            }
        ],
        responses: {
            201: 'Visit recorded'
        }
    }
});
