import type { NextRequest } from 'next/server';
import {
    assertSelf,
    makeHandler,
    noContent,
    ok,
    readJson,
    validateParams,
    validatePayload
} from '@/server/utils/reqwest';
import { userService } from '@/server/services/user/service';
import { withAuth } from '@/server/utils/reqwest';
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
    const { userId } = validateParams(ShoppingListParamsSchema, {
        userId: request.nextUrl.pathname.split('/').at(-2)
    });

    assertSelf(Number(userId));

    const shoppingList = await userService.getShoppingList(Number(userId));

    return ok(shoppingList);
}

/**
 * Handles POST requests to `/api/users/{id}/shopping-list` to create a new shopping list.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with the created shopping list item.
 * @throws {Error} Throws an error if the request fails.
 */
async function postHandler(request: NextRequest) {
    const { userId } = validateParams(ShoppingListParamsSchema, {
        userId: request.nextUrl.pathname.split('/').at(-2)
    });

    assertSelf(Number(userId));

    const rawPayload = await readJson(request);

    const payload = validatePayload(ShoppingListPayloadSchema, rawPayload);

    const shoppingList = await userService.createShoppingList(
        Number(userId),
        payload.recipeId,
        payload.ingredients
    );

    return ok(shoppingList);
}

/**
 * Handles PUT requests to `/api/users/{id}/shopping-list` to update a user's shopping list.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with the updated shopping list item.
 * @throws {Error} Throws an error if the request fails.
 */
async function putHandler(request: NextRequest) {
    const { userId } = validateParams(ShoppingListParamsSchema, {
        userId: request.nextUrl.pathname.split('/').at(-2)
    });

    const rawPayload = await readJson(request);

    assertSelf(Number(userId));

    const payload = validatePayload(ShoppingListPayloadSchema, rawPayload);

    const shoppingList = await userService.updateShoppingList(
        Number(userId),
        payload.recipeId,
        payload.ingredients
    );

    return ok(shoppingList);
}

/**
 * Handles DELETE requests to `/api/users/{id}/shopping-list` to delete a user's shopping list.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with a message indicating that the shopping list has been deleted.
 * @throws {Error} Throws an error if the request fails.
 */
async function deleteHandler(request: NextRequest) {
    const { userId } = validateParams(ShoppingListParamsSchema, {
        userId: request.nextUrl.pathname.split('/').at(-2)
    });

    assertSelf(Number(userId));

    const rawPayload = await readJson(request);

    const payload = validatePayload(
        DeleteShoppingListPayloadSchema,
        rawPayload
    );

    await userService.deleteShoppingList(
        Number(userId),
        payload.recipeId ?? undefined
    );

    return noContent();
}

export const GET = makeHandler(getHandler, withAuth);
export const POST = makeHandler(postHandler, withAuth);
export const PUT = makeHandler(putHandler, withAuth);
export const DELETE = makeHandler(deleteHandler, withAuth);
