import { ingredientService } from '@/server/services/ingredient/service';
import { makeHandler, ok } from '@/server/utils/reqwest';
import { z } from 'zod';
import { registerRouteDocs } from '@/server/utils/api-docs/registry';
import { AuthLevel } from '@/common/types';

//|=============================================================================================|//
//?                                     VALIDATION SCHEMAS                                      ?//
//|=============================================================================================|//

const IngredientResponseSchema = z.object({
    id: z.number(),
    name: z.string()
});

//|=============================================================================================|//
//?                                           HANDLERS                                          ?//
//|=============================================================================================|//

/**
 * Handles GET requests to `/api/ingredients` to return a list of all ingredients.
 *
 * @returns IngredientDTO[]
 *
 * - 200: Success, with ingredient data.
 * - 500: Internal Server Error, if there is another error during the creation process.
 */
async function getHandler() {
    const ingredients = await ingredientService.getAll();

    return ok(ingredients);
}

export const GET = makeHandler(getHandler);

//|=============================================================================================|//
//?                                        DOCUMENTATION                                        ?//
//|=============================================================================================|//

registerRouteDocs('/api/ingredients', {
    category: 'Ingredients',
    GET: {
        summary: 'List all ingredients.',
        description: `Returns the complete list of known ingredients.`,
        auth: AuthLevel.PUBLIC,
        clientUsage: [
            {
                apiClient: 'apiClient.ingredient.getIngredients',
                hook: 'chqc.ingredient.useIngredients'
            }
        ],
        responses: {
            200: {
                description: 'Ingredient list',
                schema: z.array(IngredientResponseSchema)
            }
        }
    }
});
