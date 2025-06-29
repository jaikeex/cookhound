import { logRequest, logResponse } from '@/server/logger';
import { userService } from '@/server/services';
import { handleServerError, validateParams } from '@/server/utils/reqwest';
import { RequestContext } from '@/server/utils/reqwest/context';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const LastViewedParamsSchema = z.strictObject({
    userId: z.coerce.number().int().positive()
});

/**
 * Handles GET requests to `/api/users/{id}/last-viewed` to fetch a user's last viewed recipes.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with the user's last viewed recipes.
 * @throws {Error} Throws an error if the request fails.
 */
export async function GET(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const { userId } = validateParams(LastViewedParamsSchema, {
                userId: request.nextUrl.pathname.split('/').at(-2)
            });

            const lastViewedRecipes = await userService.getLastViewedRecipes(
                Number(userId)
            );

            const response = Response.json(lastViewedRecipes);

            logResponse(response);
            return response;
        } catch (error: unknown) {
            return handleServerError(error);
        }
    });
}
