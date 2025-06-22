import type { NextRequest } from 'next/server';
import { RequestContext } from '@/server/utils/reqwest/context';
import { handleServerError } from '@/server/utils/reqwest';
import { logRequest, logResponse } from '@/server/logger';
import { userService } from '@/server/services/user/service';
import { UserRole } from '@/common/types';
import { ServerError } from '@/server/error';

//|=============================================================================================|//

export async function GET(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            if (RequestContext.getUserRole() === UserRole.Guest) {
                throw new ServerError('auth.error.unauthorized', 401);
            }

            const shoppingList = await userService.getShoppingList();

            const response = Response.json({ shoppingList });

            logResponse(response);
            return response;
        } catch (error: any) {
            return handleServerError(error);
        }
    });
}

export async function POST(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            if (RequestContext.getUserRole() === UserRole.Guest) {
                throw new ServerError('auth.error.unauthorized', 401);
            }

            const payload = await request.json();

            const shoppingList = await userService.createShoppingList(
                payload.recipeId,
                payload.ingredients
            );

            const response = Response.json({ shoppingList });

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

            const payload = await request.json();

            const shoppingList = await userService.updateShoppingListOrder(
                payload.recipeId,
                payload.ingredients
            );

            const response = Response.json({ shoppingList });

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

            const { recipeId } = await request.json();

            await userService.deleteShoppingList(recipeId);

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
