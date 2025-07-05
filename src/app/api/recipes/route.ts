import { logRequest, logResponse } from '@/server/logger';
import { recipeService } from '@/server/services/recipe/service';
import { RequestContext } from '@/server/utils/reqwest/context';
import { handleServerError, validatePayload } from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { UserRole } from '@/common/types';
import { AuthErrorUnauthorized } from '@/server/error';
import { withRateLimit } from '@/server/utils/rate-limit';
import type { Locale } from '@/client/locales';
import { z } from 'zod';
import { validateQuery } from '@/server/utils/reqwest/validators';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const FrontPageRecipesSchema = z.strictObject({
    language: z.enum(['en', 'cs'], {
        errorMap: () => ({ message: 'Language must be supported' })
    }),
    batch: z.coerce.number().int().positive(),
    perPage: z.coerce.number().int().positive()
});

const IngredientForCreateSchema = z.strictObject({
    name: z.string().trim().min(1).max(100),
    quantity: z.string().trim().max(50).nullable()
});

const RecipeForCreatePayloadSchema = z.strictObject({
    language: z.enum(['en', 'cs'], {
        errorMap: () => ({ message: 'Language must be supported' })
    }),
    title: z.string().trim().min(1).max(200),
    instructions: z.array(z.string().trim().min(1)).min(1),
    notes: z.string().trim().max(1400).nullable(),
    time: z.coerce.number().int().positive().nullable(),
    portionSize: z.coerce.number().int().positive().nullable(),
    imageUrl: z.string().trim().url().nullable(),
    ingredients: z.array(IngredientForCreateSchema).min(1),
    tags: z
        .array(z.object({ id: z.number() }))
        .max(10)
        .nullable()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
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

            const payload = validateQuery(
                FrontPageRecipesSchema,
                request.nextUrl
            );

            const { language, batch, perPage } = payload;

            const recipes = await recipeService.getFrontPageRecipes(
                language as Locale,
                batch,
                perPage
            );

            const response = NextResponse.json(recipes);

            logResponse(response);
            return response;
        } catch (error: unknown) {
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
 * - 400: Bad Request, if the payload validation fails.
 * - 500: Internal Server Error, if there is another error during the creation process.
 */
async function createRecipeHandler(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            if (RequestContext.getUserRole() === UserRole.Guest) {
                throw new AuthErrorUnauthorized();
            }

            const rawPayload = await request.json();

            const payload = validatePayload(
                RecipeForCreatePayloadSchema,
                rawPayload
            );

            const recipe = await recipeService.createRecipe(payload);

            const response = Response.json(recipe, { status: 201 });

            logResponse(response);

            return response;
        } catch (error: unknown) {
            return handleServerError(error);
        }
    });
}

export const POST = withRateLimit(createRecipeHandler, {
    maxRequests: 20,
    windowSizeInSeconds: 600
});
