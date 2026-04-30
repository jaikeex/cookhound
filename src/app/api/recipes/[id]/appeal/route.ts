import type { NextRequest } from 'next/server';
import { recipeFlagService } from '@/server/services/recipe-flag/service';
import {
    validatePayload,
    validateParams,
    makeHandler,
    created,
    readJson
} from '@/server/utils/reqwest';
import { withRateLimit } from '@/server/utils/rate-limit/wrapper';
import { withAuth } from '@/server/utils/reqwest';
import { z } from 'zod';
import { registerRouteDocs } from '@/server/utils/api-docs/registry';
import { AuthLevel } from '@/common/types';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const AppealParamsSchema = z.strictObject({
    recipeId: z.coerce.number().int().positive()
});

const AppealForCreateSchema = z.strictObject({
    flagId: z.coerce.number().int().positive(),
    message: z.string().trim().min(10).max(2000)
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles POST requests to `/api/recipes/{id}/appeal` for an author to
 * contest a content flag on a recipe.
 *
 * ! This endpoint is restricted and only accessible to authenticated users.
 *
 * - 201: Appeal created.
 * - 400: Validation failed.
 * - 401: Not authenticated.
 * - 403: Caller is not the recipe author.
 * - 404: Flag not found.
 * - 409: Flag is no longer active, or a pending appeal already exists.
 * - 429: Rate limit exceeded.
 */
async function postHandler(request: NextRequest) {
    //?—————————————————————————————————————————————————————————————————————————————————————————?//
    //?                                     RECIPE ID PARAM                                     ?//
    ///
    //# The recipeId path param is used simply for making this route more semantic. The logic
    //# does not use it (instead working with the flagId from the payload), but routing it through
    //# a flagId feels too clunky from the client code pov.
    ///
    //?—————————————————————————————————————————————————————————————————————————————————————————?//

    validateParams(AppealParamsSchema, {
        recipeId: request.nextUrl.pathname.split('/').at(-2)
    });

    const rawPayload = await readJson(request);
    const payload = validatePayload(AppealForCreateSchema, rawPayload);

    const appeal = await recipeFlagService.createAppeal(
        payload.flagId,
        payload.message
    );

    return created(appeal);
}

export const POST = makeHandler(
    postHandler,
    withAuth,
    withRateLimit({
        maxRequests: 5,
        windowSizeInSeconds: 60 * 60 * 24 // 24 hours
    })
);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/recipes/{id}/appeal', {
    category: 'Recipes',
    POST: {
        summary: 'Submit an appeal against a recipe content flag.',
        description: `Author-only. Creates a pending appeal record bound to
            the supplied flag id and notifies admins via email. Only one
            pending appeal may exist per flag.`,
        auth: AuthLevel.AUTHENTICATED,
        rateLimit: { maxRequests: 5, windowSizeInSeconds: 86400 },
        bodySchema: AppealForCreateSchema,
        clientUsage: [
            {
                apiClient: 'apiClient.recipeFlag.submitAppeal',
                hook: 'chqc.recipeFlag.useSubmitAppeal'
            }
        ],
        responses: {
            201: 'Appeal created',
            400: 'Validation failed',
            401: 'Not authenticated',
            403: 'Caller is not the recipe author',
            404: 'Flag not found',
            409: 'Flag inactive or appeal already pending',
            429: 'Rate limit exceeded'
        }
    }
});
