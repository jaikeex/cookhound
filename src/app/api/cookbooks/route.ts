import {
    created,
    makeHandler,
    readJson,
    validatePayload
} from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import { withRateLimit } from '@/server/utils/rate-limit';
import { withAuth } from '@/server/utils/reqwest';
import { z } from 'zod';
import { CookbookVisibility } from '@/common/types';
import {
    registerRouteDocs,
    CookbookResponseSchema
} from '@/server/utils/api-docs';
import { cookbookService } from '@/server/services/cookbook/service';
import { AuthLevel } from '@/common/types';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const CookbookForCreateSchema = z.strictObject({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(1400).nullable(),
    visibility: z.enum(CookbookVisibility)
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles POST requests to `/api/cookbooks` to create a new cookbook.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with the created cookbook.
 */
async function postHandler(request: NextRequest) {
    const rawPayload = await readJson(request);

    const payload = validatePayload(CookbookForCreateSchema, rawPayload);

    const cookbook = await cookbookService.createCookbook(payload);

    return created(cookbook);
}

export const POST = makeHandler(
    postHandler,
    withAuth,
    withRateLimit({
        maxRequests: 5,
        windowSizeInSeconds: 60
    })
);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/cookbooks', {
    category: 'Cookbooks',
    POST: {
        summary: 'Create a new cookbook.',
        description: `Creates a new cookbook owned by the authenticated
            user.`,
        auth: AuthLevel.AUTHENTICATED,
        rateLimit: { maxRequests: 5, windowSizeInSeconds: 60 },
        bodySchema: CookbookForCreateSchema,
        clientUsage: [
            {
                apiClient: 'apiClient.cookbook.createCookbook',
                hook: 'chqc.cookbook.useCreateCookbook'
            }
        ],
        responses: {
            201: {
                description: 'Created cookbook',
                schema: CookbookResponseSchema
            },
            400: 'Validation failed',
            401: 'Not authenticated',
            429: 'Rate limit exceeded'
        }
    }
});
