import { recipeFilterService } from '@/server/services/recipe-filter/service';
import { makeHandler, ok, validatePayload } from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import type { RecipeFilterParams } from '@/common/types';
import { z } from 'zod';
import { SUPPORTED_LOCALES } from '@/common/constants';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const FilterRecipesSchema = z.strictObject({
    language: z.enum(SUPPORTED_LOCALES),
    batch: z.coerce.number().int().positive(),
    perPage: z.coerce.number().int().positive(),
    containsIngredients: z.array(z.coerce.number().int().positive()).optional(),
    excludesIngredients: z.array(z.coerce.number().int().positive()).optional(),
    timeMin: z.coerce.number().int().nonnegative().optional(),
    timeMax: z.coerce.number().int().nonnegative().optional(),
    tags: z.array(z.coerce.number().int().positive()).optional(),
    hasImage: z.preprocess(
        (v) => (v === undefined ? undefined : v === 'true'),
        z.boolean().optional()
    )
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles GET requests to `/api/recipes/filter`.
 *
 * @returns RecipeForDisplayDTO[]
 */
async function getHandler(request: NextRequest) {
    const params = request.nextUrl.searchParams;

    const raw = {
        language: params.get('language') ?? undefined,
        batch: params.get('batch') ?? undefined,
        perPage: params.get('perPage') ?? undefined,
        containsIngredients: params.getAll('containsIngredients'),
        excludesIngredients: params.getAll('excludesIngredients'),
        timeMin: params.get('timeMin') ?? undefined,
        timeMax: params.get('timeMax') ?? undefined,
        tags: params.getAll('tags'),
        hasImage: params.get('hasImage') ?? undefined
    };

    const payload = validatePayload(FilterRecipesSchema, raw);

    const { language, batch, perPage, timeMin, timeMax, hasImage } = payload;

    const filters: RecipeFilterParams = {
        containsIngredients: payload.containsIngredients?.length
            ? payload.containsIngredients
            : undefined,
        excludesIngredients: payload.excludesIngredients?.length
            ? payload.excludesIngredients
            : undefined,
        timeMin,
        timeMax,
        tags: payload.tags?.length ? payload.tags : undefined,
        hasImage: hasImage === true ? true : undefined
    };

    const recipes = await recipeFilterService.filterRecipes(
        filters,
        language,
        batch,
        perPage
    );

    return ok(recipes);
}

export const GET = makeHandler(getHandler);
