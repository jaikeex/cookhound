import { apiService } from '@/client/services/ApiService';
import type { Recipe } from '@/client/types/recipe';
import type { RecipeForCreate } from '@/client/services';

/**
 * Service for recipe-related operations.
 */
class RecipeService {
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
        return await apiService.get({ url: `/recipe/${id}`, next });
    }

    async createRecipe(
        recipe: RecipeForCreate,
        next?: NextFetchRequestConfig
    ): Promise<Recipe> {
        return await apiService.post({ url: '/recipe', data: recipe, next });
    }
}

export const recipeService = new RecipeService();
