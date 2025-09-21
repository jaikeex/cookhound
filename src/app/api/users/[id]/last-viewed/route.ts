import { userService } from '@/server/services';
import {
    assertSelf,
    makeHandler,
    ok,
    validateParams
} from '@/server/utils/reqwest';
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
async function getHandler(request: NextRequest) {
    const { userId } = validateParams(LastViewedParamsSchema, {
        userId: request.nextUrl.pathname.split('/').at(-2)
    });

    assertSelf(userId);

    const lastViewedRecipes = await userService.getLastViewedRecipes(
        Number(userId)
    );

    return ok(lastViewedRecipes);
}

export const GET = makeHandler(getHandler);
