import { makeHandler, ok, validateParams } from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { cookbookService } from '@/server/services/cookbook/service';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const CookbookParamsSchema = z.strictObject({
    displayId: z.uuid()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles GET requests to `/api/cookbooks/display/{displayId}` to fetch a specific cookbook.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with the cookbook data.
 *
 * - 200: Success, with cookbook data.
 * - 400: Bad Request, if the cookbook display ID is not a UUID.
 * - 404: Not Found, if the cookbook is not found.
 * - 500: Internal Server Error, if there is another error during the fetching process.
 */
async function getHandler(request: NextRequest) {
    const { displayId } = validateParams(CookbookParamsSchema, {
        displayId: request.nextUrl.pathname.split('/').pop()
    });

    const cookbook = await cookbookService.getCookbookByDisplayId(displayId);

    return ok(cookbook);
}

export const GET = makeHandler(getHandler);
