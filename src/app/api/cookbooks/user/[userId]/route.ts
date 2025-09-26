import { makeHandler, validateParams } from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { cookbookService } from '@/server/services/cookbook/service';
import { ok } from '@/server/utils/reqwest';
import { z } from 'zod';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const CookbookUserParamsSchema = z.strictObject({
    userId: z.coerce.number().int().positive()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles GET requests to `/api/cookbooks/user/{userId}` to fetch a paginated list of cookbooks by user.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with the paginated list of cookbooks by user.
 */
async function getHandler(request: NextRequest) {
    const { userId } = validateParams(CookbookUserParamsSchema, {
        userId: request.nextUrl.pathname.split('/').pop()
    });

    const cookbooks = await cookbookService.getCookbooksByOwnerId(
        Number(userId)
    );

    return ok(cookbooks);
}

export const GET = makeHandler(getHandler);
