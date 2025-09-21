import {
    makeHandler,
    ok,
    readJson,
    validatePayload
} from '@/server/utils/reqwest';
import { openaiApiService } from '@/server/services/openai-api/service';
import type { NextRequest } from 'next/server';
import { withRateLimit } from '@/server/utils/rate-limit';
import { z } from 'zod';
import type { RecipeDTO } from '@/common/types';
import { withAuth } from '@/server/utils/reqwest';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const IngredientForTagSuggestionSchema = z.looseObject({
    name: z.string().trim().min(1).max(100),
    quantity: z.string().trim().max(50).nullable()
});

const RecipeForTagSuggestionPayloadSchema = z.looseObject({
    language: z.enum(['en', 'cs'], {
        error: () => 'Language must be supported'
    }),
    title: z.string().trim().min(1).max(200),
    instructions: z.array(z.string().trim().min(1)).min(1),
    notes: z.string().trim().max(1400).nullable(),
    time: z.coerce.number().int().positive().nullable(),
    portionSize: z.coerce.number().int().positive().nullable(),
    imageUrl: z.string().trim().nullable(),
    ingredients: z.array(IngredientForTagSuggestionSchema).min(1)
});

async function postHandler(request: NextRequest) {
    const rawPayload = await readJson(request);

    const payload = validatePayload(
        RecipeForTagSuggestionPayloadSchema,
        rawPayload
    );

    const tags = await openaiApiService.suggestRecipeTags(payload as RecipeDTO);

    return ok(tags);
}

export const POST = makeHandler(
    postHandler,
    withAuth,
    withRateLimit({
        maxRequests: 20,
        windowSizeInSeconds: 600
    })
);
