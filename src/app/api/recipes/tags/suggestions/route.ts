import { RequestContext } from '@/server/utils/reqwest/context';
import { logRequest, logResponse } from '@/server/logger';
import { handleServerError, validatePayload } from '@/server/utils/reqwest';
import { openaiApiService } from '@/server/services/openai-api/service';
import type { NextRequest } from 'next/server';
import { withRateLimit } from '@/server/utils/rate-limit';
import { z } from 'zod';
import type { RecipeDTO } from '@/common/types';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const IngredientForTagSuggestionSchema = z
    .strictObject({
        name: z.string().trim().min(1).max(100),
        quantity: z.string().trim().max(50).nullable()
    })
    .passthrough();

const RecipeForTagSuggestionPayloadSchema = z
    .object({
        language: z.enum(['en', 'cs'], {
            errorMap: () => ({ message: 'Language must be supported' })
        }),
        title: z.string().trim().min(1).max(200),
        instructions: z.array(z.string().trim().min(1)).min(1),
        notes: z.string().trim().max(1400).nullable(),
        time: z.coerce.number().int().positive().nullable(),
        portionSize: z.coerce.number().int().positive().nullable(),
        imageUrl: z.string().trim().nullable(),
        ingredients: z.array(IngredientForTagSuggestionSchema).min(1)
    })
    .passthrough();

async function suggestionsHandler(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const rawPayload = await request.json();

            const payload = validatePayload(
                RecipeForTagSuggestionPayloadSchema,
                rawPayload
            );

            const tags = await openaiApiService.suggestRecipeTags(
                payload as RecipeDTO
            );

            const response = Response.json(tags);

            logResponse(response);
            return response;
        } catch (error: unknown) {
            return handleServerError(error);
        }
    });
}

export const POST = withRateLimit(suggestionsHandler, {
    maxRequests: 20,
    windowSizeInSeconds: 600
});
