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
import {
    registerRouteDocs,
    CookbookResponseSchema
} from '@/server/utils/api-docs';
import { AuthLevel } from '@/common/types';

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

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/cookbooks/{id}', {
    category: 'Cookbooks',
    GET: {
        summary: 'Get a cookbook by ID.',
        description: `Includes the recipe list.`,
        auth: AuthLevel.PUBLIC,
        clientUsage: [
            {
                apiClient: 'apiClient.cookbook.getCookbookById',
                hook: 'chqc.cookbook.useCookbookById'
            }
        ],
        responses: {
            200: {
                description: 'Cookbook data with recipes',
                schema: CookbookResponseSchema
            },
            404: 'Cookbook not found'
        }
    },
    DELETE: {
        summary: 'Delete a cookbook.',
        description: `Owner-only. Recipes in the cookbook are not
            affected.`,
        auth: AuthLevel.AUTHENTICATED,
        clientUsage: [
            {
                apiClient: 'apiClient.cookbook.deleteCookbook',
                hook: 'chqc.cookbook.useDeleteCookbook'
            }
        ],
        responses: {
            204: 'Cookbook deleted',
            401: 'Not authenticated'
        }
    }
});
