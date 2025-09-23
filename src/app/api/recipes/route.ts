import { recipeService } from '@/server/services/recipe/service';
import {
    created,
    makeHandler,
    ok,
    readJson,
    validatePayload
} from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { withRateLimit } from '@/server/utils/rate-limit';
import { withAuth } from '@/server/utils/reqwest';
import type { Locale } from '@/common/types';
import { z } from 'zod';
import { validateQuery } from '@/server/utils/reqwest';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const FrontPageRecipesSchema = z.strictObject({
    language: z.enum(['en', 'cs'], {
        error: () => 'Language must be supported'
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
        error: () => 'Language must be supported'
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
async function getHandler(request: NextRequest) {
    const payload = validateQuery(FrontPageRecipesSchema, request.nextUrl);

    const { language, batch, perPage } = payload;

    const recipes = await recipeService.getFrontPageRecipes(
        language as Locale,
        batch,
        perPage
    );

    return ok(recipes);
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
async function postHandler(request: NextRequest) {
    const rawPayload = await readJson(request);

    const payload = validatePayload(RecipeForCreatePayloadSchema, rawPayload);

    const recipe = await recipeService.createRecipe(payload);

    return created(recipe, { status: 201 });
}

export const GET = makeHandler(getHandler);

export const POST = makeHandler(
    postHandler,
    withAuth,
    withRateLimit({
        maxRequests: 20,
        windowSizeInSeconds: 600
    })
);
