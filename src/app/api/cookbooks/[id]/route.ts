import {
    makeHandler,
    noContent,
    ok,
    validateParams,
    withAuth
} from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { cookbookService } from '@/server/services/cookbook/service';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const CookbookParamsSchema = z.strictObject({
    cookbookId: z.coerce.number().int().positive()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles GET requests to `/api/cookbooks/{id}` to fetch a specific cookbook.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with the cookbook data.
 *
 * - 200: Success, with cookbook data.
 * - 400: Bad Request, if the cookbook ID is not a number.
 * - 404: Not Found, if the cookbook is not found.
 * - 500: Internal Server Error, if there is another error during the fetching process.
 */
async function getHandler(request: NextRequest) {
    const { cookbookId } = validateParams(CookbookParamsSchema, {
        cookbookId: request.nextUrl.pathname.split('/').pop()
    });

    const cookbook = await cookbookService.getCookbookById(Number(cookbookId));

    return ok(cookbook);
}

/**
 * Handles DELETE requests to `/api/cookbooks/{id}` to delete a specific cookbook.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with the cookbook data.
 */
async function deleteHandler(request: NextRequest) {
    const { cookbookId } = validateParams(CookbookParamsSchema, {
        cookbookId: request.nextUrl.pathname.split('/').pop()
    });

    await cookbookService.deleteCookbook(Number(cookbookId));

    return noContent();
}

export const GET = makeHandler(getHandler);
export const DELETE = makeHandler(deleteHandler, withAuth);
