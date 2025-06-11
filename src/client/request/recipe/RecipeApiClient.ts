import { apiRequestWrapper } from '@/client/request/ApiRequestWrapper';
import type { Recipe, RecipeForCreate } from '@/common/types';

/**
 * Service for recipe-related operations.
 */
class RecipeApiClient {
    /**
     * Gets recipe by id.
     *
     * @param id - The id of the recipe to get.
     * @param next - The Next.js fetch request configuration.
     *
     * @returns {Promise<void>} A promise that resolves when the recipe is retrieved.
     * @throws {Error} Throws an error if the request fails.
     */
    async getRecipeById(
        id: string,
        next?: NextFetchRequestConfig
    ): Promise<Recipe> {
        return await apiRequestWrapper.get({ url: `/recipe/${id}`, next });
    }

    async createRecipe(
        recipe: RecipeForCreate,
        next?: NextFetchRequestConfig
    ): Promise<Recipe> {
        return await apiRequestWrapper.post({
            url: '/recipe',
            data: recipe,
            next
        });
    }
}

export const recipeApiClient = new RecipeApiClient();
