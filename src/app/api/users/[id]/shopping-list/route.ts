import type { NextRequest } from 'next/server';
import { RequestContext } from '@/server/utils/reqwest/context';
import { handleServerError } from '@/server/utils/reqwest';
import { logRequest, logResponse } from '@/server/logger';
import { userService } from '@/server/services/user/service';
import { UserRole } from '@/common/types';
import { ServerError } from '@/server/error';

//|=============================================================================================|//

/**
 * Handles GET requests to `/api/users/{id}/shopping-list` to fetch a user's shopping list.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with the user's shopping list.
 * @throws {Error} Throws an error if the request fails.
 */
export async function GET(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            if (RequestContext.getUserRole() === UserRole.Guest) {
                throw new ServerError('auth.error.unauthorized', 401);
            }

            const userId = request.nextUrl.pathname.split('/').at(-2);

            if (!userId || isNaN(Number(userId))) {
                throw new ServerError('app.error.bad-request', 400);
            }

            const shoppingList = await userService.getShoppingList(
                Number(userId)
            );

            const response = Response.json(shoppingList);

            logResponse(response);
            return response;
        } catch (error: any) {
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
export async function POST(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            if (RequestContext.getUserRole() === UserRole.Guest) {
                throw new ServerError('auth.error.unauthorized', 401);
            }

            const userId = request.nextUrl.pathname.split('/').at(-2);

            if (!userId || isNaN(Number(userId))) {
                throw new ServerError('app.error.bad-request', 400);
            }

            const payload = await request.json();

            const shoppingList = await userService.createShoppingList(
                Number(userId),
                payload.recipeId,
                payload.ingredients
            );

            const response = Response.json(shoppingList);

            logResponse(response);
            return response;
        } catch (error: any) {
            return handleServerError(error);
        }
    });
}

export async function PUT(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            if (RequestContext.getUserRole() === UserRole.Guest) {
                throw new ServerError('auth.error.unauthorized', 401);
            }

            const userId = request.nextUrl.pathname.split('/').at(-2);

            if (!userId || isNaN(Number(userId))) {
                throw new ServerError('app.error.bad-request', 400);
            }

            const payload = await request.json();

            const shoppingList = await userService.updateShoppingList(
                Number(userId),
                payload.recipeId,
                payload.ingredients
            );

            const response = Response.json(shoppingList);

            logResponse(response);
            return response;
        } catch (error: any) {
            return handleServerError(error);
        }
    });
}

export async function DELETE(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            if (RequestContext.getUserRole() === UserRole.Guest) {
                throw new ServerError('auth.error.unauthorized', 401);
            }

            const userId = request.nextUrl.pathname.split('/').at(-2);

            if (!userId || isNaN(Number(userId))) {
                throw new ServerError('app.error.bad-request', 400);
            }

            const { recipeId } = await request.json();

            await userService.deleteShoppingList(Number(userId), recipeId);

            const response = Response.json({
                message: 'Shopping list deleted'
            });

            logResponse(response);
            return response;
        } catch (error: any) {
            return handleServerError(error);
        }
    });
}
