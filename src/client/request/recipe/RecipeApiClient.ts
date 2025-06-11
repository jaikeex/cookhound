import { apiRequestWrapper } from '@/client/request/ApiRequestWrapper';
import type { Recipe, RecipeForCreate } from '@/common/types';

/**
 * Service for recipe-related operations.
 */
class RecipeApiClient {
    /**
     * Gets a recipe by its ID by calling `GET /api/recipe/{id}`.
     *
     * @param id - The ID of the recipe to retrieve.
     * @param next - Optional Next.js fetch request configuration.
     * @returns A promise that resolves to the recipe.
     * @throws {Error} Throws an error if the request fails.
     */
    async getRecipeById(
        id: string,
        next?: NextFetchRequestConfig
    ): Promise<Recipe> {
        return await apiRequestWrapper.get({ url: `/recipe/${id}`, next });
    }

    /**
     * Creates a new recipe by calling `POST /api/recipe`.
     *
     * @param recipe - The recipe data for creation.
     * @param next - Optional Next.js fetch request configuration.
     * @returns A promise that resolves to the created recipe.
     * @throws {Error} Throws an error if the request fails.
     */
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
