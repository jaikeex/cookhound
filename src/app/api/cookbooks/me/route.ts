import type { NextRequest } from 'next/server';
import {
    readJson,
    validatePayload,
    ok,
    assertAuthenticated,
    makeHandler,
    withAuth
} from '@/server/utils/reqwest';
import { cookbookService } from '@/server/services/cookbook/service';
import { z } from 'zod';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const CookbookReorderSchema = z.strictObject({
    orderedCookbookIds: z.array(z.coerce.number().int().positive())
});

/**
 * Handles PUT requests to `/api/cookbooks` to reorder the cookbooks owned by the user.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with the reordered cookbooks.
 */
async function putHandler(request: NextRequest) {
    const userId = assertAuthenticated();

    const rawPayload = await readJson(request);

    const payload = validatePayload(CookbookReorderSchema, rawPayload);

    await cookbookService.reorderOwnCookbooks(
        Number(userId),
        payload.orderedCookbookIds
    );

    return ok({ message: 'Cookbooks reordered' });
}

export const PUT = makeHandler(putHandler, withAuth);
