import { ingredientService } from '@/server/services/ingredient/service';
import { makeHandler, ok, validateQuery } from '@/server/utils/reqwest';
import type { NextRequest } from 'next/server';
import type { Locale } from '@/common/types';
import { z } from 'zod';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const IngredientsQuerySchema = z.strictObject({
    language: z.enum(['en', 'cs'])
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles GET requests to `/api/ingredients` to return a list of all ingredients for the given language.
 *
 * @returns IngredientDTO[]
 * 
 * - 200: Success, with ingredient data.
 * - 400: Bad Request, if the param validation fails.
 * - 401: Unauthorized, if the user is not authenticated.
 * - 500: Internal Server Error, if there is another error during the creation process.

 */
async function getHandler(request: NextRequest) {
    const { language } = validateQuery(IngredientsQuerySchema, request.nextUrl);

    const ingredients = await ingredientService.getAll(language as Locale);

    return ok(ingredients);
}

export const GET = makeHandler(getHandler);
