import {
    makeHandler,
    noContent,
    ok,
    readJson,
    validateParams,
    validatePayload
} from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { withAuth } from '@/server/utils/reqwest';
import { z } from 'zod';
import { cookbookService } from '@/server/services/cookbook/service';
import { withRateLimit } from '@/server/utils/rate-limit/wrapper';
import { registerRouteDocs } from '@/server/utils/api-docs/registry';
import { AuthLevel } from '@/common/types';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const CookbookParamsSchema = z.strictObject({
    cookbookId: z.coerce.number().int().positive()
});

const CookbookRecipeSchema = z.strictObject({
    recipeId: z.coerce.number().int().positive()
});

const CookbookRecipeReorderSchema = z.strictObject({
    orderedRecipeIds: z.array(z.coerce.number().int().positive())
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles POST requests to `/api/cookbooks/{id}/recipes` to add a recipe to a cookbook.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with the created cookbook.
 *
 * - 200: Success, if the recipe is added to the cookbook.
 * - 204: No Content, if the recipe is already in the cookbook.
 * - 400: Bad Request, if the recipe ID is not a number.
 * - 404: Not Found, if the cookbook is not found.
 * - 500: Internal Server Error, if there is another error during the addition process.
 */
async function postHandler(request: NextRequest) {
    const { cookbookId } = validateParams(CookbookParamsSchema, {
        cookbookId: request.nextUrl.pathname.split('/').at(-2)
    });

    const rawPayload = await readJson(request);

    const payload = validatePayload(CookbookRecipeSchema, rawPayload);

    const { success } = await cookbookService.addRecipeToCookbook(
        Number(cookbookId),
        payload.recipeId
    );

    return success ? ok({ message: 'Recipe added to cookbook' }) : noContent();
}

/**
 * Handles DELETE requests to `/api/cookbooks/{id}/recipes` to remove a recipe from a cookbook.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with a message indicating that the recipe has been removed from the cookbook.
 *
 * - 200: Success, with a message indicating that the recipe has been removed from the cookbook.
 */

async function deleteHandler(request: NextRequest) {
    const { cookbookId } = validateParams(CookbookParamsSchema, {
        cookbookId: request.nextUrl.pathname.split('/').at(-2)
    });

    const rawPayload = await readJson(request);

    const payload = validatePayload(CookbookRecipeSchema, rawPayload);

    await cookbookService.removeRecipeFromCookbook(
        Number(cookbookId),
        payload.recipeId
    );

    return noContent();
}

/**
 * Handles PUT requests to `/api/cookbooks/{id}/recipes` to reorder recipes in a cookbook.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with a message indicating that the recipes have been reordered in the cookbook.
 *
 * - 200: Success, with a message indicating that the recipes have been reordered in the cookbook.
 */
async function putHandler(request: NextRequest) {
    const { cookbookId } = validateParams(CookbookParamsSchema, {
        cookbookId: request.nextUrl.pathname.split('/').at(-2)
    });

    const rawPayload = await readJson(request);

    const payload = validatePayload(CookbookRecipeReorderSchema, rawPayload);

    await cookbookService.reorderCookbookRecipes(
        Number(cookbookId),
        payload.orderedRecipeIds
    );

    return noContent();
}

export const POST = makeHandler(
    postHandler,
    withAuth,
    withRateLimit({
        maxRequests: 10,
        windowSizeInSeconds: 60
    })
);

export const DELETE = makeHandler(deleteHandler, withAuth);

export const PUT = makeHandler(
    putHandler,
    withAuth,
    withRateLimit({
        maxRequests: 10,
        windowSizeInSeconds: 60
    })
);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/cookbooks/{id}/recipe', {
    category: 'Cookbooks',
    subcategory: 'Recipe Management',
    POST: {
        summary: 'Add a recipe to a cookbook.',
        description: `Each recipe can only appear once per
            cookbook.`,
        auth: AuthLevel.AUTHENTICATED,
        rateLimit: { maxRequests: 10, windowSizeInSeconds: 60 },
        bodySchema: CookbookRecipeSchema,
        clientUsage: [
            {
                apiClient: 'apiClient.cookbook.addRecipeToCookbook',
                hook: 'chqc.cookbook.useAddRecipeToCookbook'
            }
        ],
        responses: {
            200: 'Recipe added',
            400: 'Validation failed',
            401: 'Not authenticated',
            409: 'Recipe already in cookbook',
            429: 'Rate limit exceeded'
        }
    },
    PUT: {
        summary: 'Reorder recipes within a cookbook.',
        description: `Expects the complete ordered list of recipe
            IDs.`,
        auth: AuthLevel.AUTHENTICATED,
        rateLimit: { maxRequests: 10, windowSizeInSeconds: 60 },
        bodySchema: CookbookRecipeReorderSchema,
        clientUsage: [
            {
                apiClient: 'apiClient.cookbook.reorderCookbookRecipes',
                hook: 'chqc.cookbook.useReorderCookbookRecipes'
            }
        ],
        responses: {
            204: 'Recipes reordered',
            401: 'Not authenticated',
            429: 'Rate limit exceeded'
        }
    },
    DELETE: {
        summary: 'Remove a recipe from a cookbook.',
        description: `Removes a recipe from the specified cookbook.`,
        auth: AuthLevel.AUTHENTICATED,
        bodySchema: CookbookRecipeSchema,
        clientUsage: [
            {
                apiClient: 'apiClient.cookbook.removeRecipeFromCookbook',
                hook: 'chqc.cookbook.useRemoveRecipeFromCookbook'
            }
        ],
        responses: {
            204: 'Recipe removed',
            401: 'Not authenticated'
        }
    }
});
