import type { NextRequest } from 'next/server';
import { RequestContext } from '@/server/utils/reqwest/context';
import {
    handleServerError,
    validateParams,
    validatePayload
} from '@/server/utils/reqwest';
import { logRequest, logResponse } from '@/server/logger';
import { userService } from '@/server/services/user/service';
import { withAuth } from '@/server/utils/session/with-auth';
import { z } from 'zod';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const ShoppingListIngredientPayloadSchema = z.strictObject({
    id: z.coerce.number().int().positive(),
    marked: z.boolean().optional(),
    quantity: z.string().trim().max(50).nullable()
});

const ShoppingListPayloadSchema = z.strictObject({
    recipeId: z.coerce.number().int().positive(),
    ingredients: z.array(ShoppingListIngredientPayloadSchema).min(1)
});

const DeleteShoppingListPayloadSchema = z.strictObject({
    recipeId: z.coerce.number().int().positive().nullable().optional()
});

const ShoppingListParamsSchema = z.strictObject({
    userId: z.coerce.number().int().positive()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles GET requests to `/api/users/{id}/shopping-list` to fetch a user's shopping list.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with the user's shopping list.
 * @throws {Error} Throws an error if the request fails.
 */
async function getHandler(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const { userId } = validateParams(ShoppingListParamsSchema, {
                userId: request.nextUrl.pathname.split('/').at(-2)
            });

            const shoppingList = await userService.getShoppingList(
                Number(userId)
            );

            const response = Response.json(shoppingList);

            logResponse(response);
            return response;
        } catch (error: unknown) {
            return handleServerError(error);
        }
    });
}

/**
 * Handles POST requests to `/api/users/{id}/shopping-list` to create a new shopping list.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with the created shopping list item.
 * @throws {Error} Throws an error if the request fails.
 */
async function postHandler(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const { userId } = validateParams(ShoppingListParamsSchema, {
                userId: request.nextUrl.pathname.split('/').at(-2)
            });

            const rawPayload = await request.json();

            const payload = validatePayload(
                ShoppingListPayloadSchema,
                rawPayload
            );

            const shoppingList = await userService.createShoppingList(
                Number(userId),
                payload.recipeId,
                payload.ingredients
            );

            const response = Response.json(shoppingList);

            logResponse(response);
            return response;
        } catch (error: unknown) {
            return handleServerError(error);
        }
    });
}

/**
 * Handles PUT requests to `/api/users/{id}/shopping-list` to update a user's shopping list.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with the updated shopping list item.
 * @throws {Error} Throws an error if the request fails.
 */
async function putHandler(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const { userId } = validateParams(ShoppingListParamsSchema, {
                userId: request.nextUrl.pathname.split('/').at(-2)
            });

            const rawPayload = await request.json();

            const payload = validatePayload(
                ShoppingListPayloadSchema,
                rawPayload
            );

            const shoppingList = await userService.updateShoppingList(
                Number(userId),
                payload.recipeId,
                payload.ingredients
            );

            const response = Response.json(shoppingList);

            logResponse(response);
            return response;
        } catch (error: unknown) {
            return handleServerError(error);
        }
    });
}

/**
 * Handles DELETE requests to `/api/users/{id}/shopping-list` to delete a user's shopping list.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with a message indicating that the shopping list has been deleted.
 * @throws {Error} Throws an error if the request fails.
 */
async function deleteHandler(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const { userId } = validateParams(ShoppingListParamsSchema, {
                userId: request.nextUrl.pathname.split('/').at(-2)
            });

            const rawPayload = await request.json();

            const payload = validatePayload(
                DeleteShoppingListPayloadSchema,
                rawPayload
            );

            await userService.deleteShoppingList(
                Number(userId),
                payload.recipeId ?? undefined
            );

            const response = Response.json({
                message: 'Shopping list deleted'
            });

            logResponse(response);
            return response;
        } catch (error: unknown) {
            return handleServerError(error);
        }
    });
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
export const PUT = withAuth(putHandler);
export const DELETE = withAuth(deleteHandler);
