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
import { withRateLimit } from '@/server/utils/rate-limit/wrapper';
import { registerRouteDocs } from '@/server/utils/api-docs/registry';
import { AuthLevel } from '@/common/types';

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

export const PUT = makeHandler(
    putHandler,
    withAuth,
    withRateLimit({
        maxRequests: 10,
        windowSizeInSeconds: 15
    })
);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/cookbooks/me', {
    category: 'Cookbooks',
    subcategory: 'User Collections',
    PUT: {
        summary: 'Reorder own cookbooks.',
        description: `Expects the complete ordered list of cookbook
            IDs.`,
        auth: AuthLevel.AUTHENTICATED,
        rateLimit: { maxRequests: 10, windowSizeInSeconds: 15 },
        bodySchema: CookbookReorderSchema,
        clientUsage: [
            {
                apiClient: 'apiClient.cookbook.reorderOwnCookbooks',
                hook: 'chqc.cookbook.useReorderOwnCookbooks'
            }
        ],
        responses: {
            200: 'Cookbooks reordered',
            401: 'Not authenticated',
            429: 'Rate limit exceeded'
        }
    }
});
