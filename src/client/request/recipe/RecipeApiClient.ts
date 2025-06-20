import { apiRequestWrapper } from '@/client/request/ApiRequestWrapper';
import type { RecipeDTO, RecipeForCreatePayload } from '@/common/types';

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
    ): Promise<RecipeDTO> {
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
        recipe: RecipeForCreatePayload,
        next?: NextFetchRequestConfig
    ): Promise<RecipeDTO> {
        return await apiRequestWrapper.post({
            url: '/recipe',
            data: recipe,
            next
        });
    }

    /**
     * Rates a recipe by calling `POST /api/recipe/{id}/rate`.
     *
     * @param id - The ID of the recipe to rate.
     * @param rating - The rating to give to the recipe.
     * @param next - Optional Next.js fetch request configuration.
     */
    async rateRecipe(
        id: string,
        rating: number,
        next?: NextFetchRequestConfig
    ) {
        return await apiRequestWrapper.post({
            url: `/recipe/${id}/rate`,
            data: { rating },
            next
        });
    }
}

export const recipeApiClient = new RecipeApiClient();
