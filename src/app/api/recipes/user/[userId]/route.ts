import type { Locale } from '@/client/locales';
import { ApplicationErrorCode } from '@/server/error/codes';
import { ValidationError } from '@/server/error/server';
import { logRequest, logResponse } from '@/server/logger';
import { recipeService } from '@/server/services';
import { handleServerError, validateQuery } from '@/server/utils/reqwest';
import { RequestContext } from '@/server/utils/reqwest/context';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const RecipesByUserSchema = z.strictObject({
    language: z.enum(['en', 'cs'], {
        error: () => 'Language must be supported'
    }),
    batch: z.coerce.number().int().positive(),
    perPage: z.coerce.number().int().positive()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles GET requests to `/api/recipes/user/{userId}` to fetch a paginated list of recipes by user.
 *
 * @param request - The incoming Next.js request object.
 * @returns A JSON response with the paginated list of recipes by user.
 * @throws {Error} Throws an error if the request fails.
 *
 * - 200: Success, with paginated list of recipes by user.
 * - 400: Bad Request, if the user ID is not a number.
 * - 500: Internal Server Error, if there is another error during the fetching process.
 */
export async function GET(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const userId = request.nextUrl.pathname.split('/').pop();

            if (!userId || isNaN(Number(userId))) {
                throw new ValidationError(
                    'app.error.bad-request',
                    ApplicationErrorCode.MISSING_FIELD
                );
            }

            const payload = validateQuery(RecipesByUserSchema, request.nextUrl);

            const { language, batch, perPage } = payload;

            const recipes = await recipeService.getUserRecipes(
                Number(userId),
                language as Locale,
                batch,
                perPage
            );

            const response = NextResponse.json(recipes);

            logResponse(response);
            return response;
        } catch (error: unknown) {
            return handleServerError(error);
        }
    });
}
