import { recipeService } from '@/server/services/recipe/service';
import type { NextRequest } from 'next/server';
import { NotFoundError, ValidationError } from '@/server/error';
import {
    makeHandler,
    noContent,
    ok,
    readJson,
    withAuth
} from '@/server/utils/reqwest';
import { validatePayload } from '@/server/utils/reqwest';
import { ApplicationErrorCode } from '@/server/error/codes';
import { z } from 'zod';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const IngredientForCreateSchema = z.strictObject({
    name: z.string().trim().min(1).max(100),
    quantity: z.string().trim().max(50).nullable(),
    category: z.string().trim().max(100).nullable().optional()
});

const RecipeForUpdateSchema = z.strictObject({
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
        .optional()
        .nullable()
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
async function getHandler(request: NextRequest) {
    /**
     * Do NOT validate the params by schema here, requesting a recipe that does
     * not exist should return a 404 error and be handled by the service, not a 400.
     */

    const id = request.nextUrl.pathname.split('/').pop();

    if (!id || isNaN(Number(id))) {
        throw new ValidationError(
            'app.error.bad-request',
            ApplicationErrorCode.MISSING_FIELD
        );
    }

    const recipe = await recipeService.getRecipeById(Number(id));

    if (!recipe) {
        throw new NotFoundError(
            'app.error.not-found',
            ApplicationErrorCode.RECIPE_NOT_FOUND
        );
    }

    return ok(recipe);
}

/**
 * Handles PUT requests to `/api/recipes/{id}` to update a specific recipe.
 *
 * ! This endpoint is restricted and only accessible to authenticated users.
 *
 * @returns A JSON response with the updated recipe data.
 *
 * - 200: Success, with the updated recipe data.
 * - 400: Bad Request, if the recipe ID is not a number.
 * - 500: Internal Server Error, if there is another error during the updating process.
 */
async function putHandler(request: NextRequest) {
    const id = request.nextUrl.pathname.split('/').pop();

    if (!id || isNaN(Number(id))) {
        throw new ValidationError(
            'app.error.bad-request',
            ApplicationErrorCode.MISSING_FIELD
        );
    }

    const rawPayload = await readJson(request);

    const payload = validatePayload(RecipeForUpdateSchema, rawPayload);

    const recipe = await recipeService.updateRecipe(Number(id), payload);

    return ok(recipe);
}

/**
 * Handles DELETE requests to `/api/recipes/{id}` to delete a specific recipe.
 *
 * ! This endpoint is restricted and only accessible to authenticated users.
 *
 * @returns A JSON response with a message indicating that the recipe has been deleted.
 *
 * - 200: Success, with a message indicating that the recipe has been deleted.
 * - 400: Bad Request, if the recipe ID is not a number.
 * - 500: Internal Server Error, if there is another error during the deletion process.
 */
async function deleteHandler(request: NextRequest) {
    const id = request.nextUrl.pathname.split('/').pop();

    if (!id || isNaN(Number(id))) {
        throw new ValidationError(
            'app.error.bad-request',
            ApplicationErrorCode.MISSING_FIELD
        );
    }

    await recipeService.deleteRecipe(Number(id));

    return noContent();
}

export const GET = makeHandler(getHandler);
export const PUT = makeHandler(putHandler, withAuth);
export const DELETE = makeHandler(deleteHandler, withAuth);
