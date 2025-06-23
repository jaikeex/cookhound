import type { Locale } from '@/client/locales';
import type { RequestConfig } from '@/client/request/ApiRequestWrapper';
import { apiRequestWrapper } from '@/client/request/ApiRequestWrapper';
import type {
    RecipeDTO,
    RecipeForCreatePayload,
    RecipeForDisplayDTO
} from '@/common/types';

/**
 * Service for recipe-related operations.
 */
class RecipeApiClient {
    /**
     * Gets a recipe by its display ID by calling `GET /api/recipe/display/{displayId}`.
     *
     * @param id - The ID of the recipe to retrieve.
     * @param config - Optional fetch request configuration.
     * @returns A promise that resolves to the recipe.
     * @throws {Error} Throws an error if the request fails.
     */
    async getRecipeByDisplayId(
        displayId: string,
        config?: RequestConfig
    ): Promise<RecipeDTO> {
        return await apiRequestWrapper.get({
            url: `/recipe/display/${displayId}`,
            ...config
        });
    }

    /**
     * Gets a recipe by its ID by calling `GET /api/recipe/id/{id}`.
     * This is the internal ID of the recipe, not the display ID.
     *
     * @param id - The ID of the recipe to retrieve.
     * @param config - Optional fetch request configuration.
     * @returns A promise that resolves to the recipe.
     * @throws {Error} Throws an error if the request fails.
     */
    async getRecipeById(
        id: string,
        config?: RequestConfig
    ): Promise<RecipeDTO> {
        return await apiRequestWrapper.get({
            url: `/recipe/id/${id}`,
            ...config
        });
    }

    /**
     * Gets a paginated list of recipes by calling `GET /api/recipe/list`.
     *
     * @param batch - The batch number to fetch.
     * @param perPage - The number of recipes per page.
     * @param config - Optional fetch request configuration.
     * @returns A promise that resolves to the paginated list of recipes.
     * @throws {Error} Throws an error if the request fails.
     */
    async getRecipeList(
        batch: number,
        perPage: number,
        config?: RequestConfig
    ): Promise<RecipeForDisplayDTO[]> {
        return await apiRequestWrapper.get({
            url: `/recipe/list?batch=${batch}&perPage=${perPage}`,
            params: { batch, perPage },
            ...config
        });
    }

    async searchRecipes(
        query: string,
        language: Locale,
        batch: number,
        perPage: number,
        config?: RequestConfig
    ): Promise<RecipeForDisplayDTO[]> {
        return await apiRequestWrapper.get({
            url: `/recipe/search?query=${query}&language=${language}&batch=${batch}&perPage=${perPage}`,
            params: { query, language, batch, perPage },
            ...config
        });
    }

    /**
     * Creates a new recipe by calling `POST /api/recipe`.
     *
     * @param recipe - The recipe data for creation.
     * @param config - Optional fetch request configuration.
     * @returns A promise that resolves to the created recipe.
     * @throws {Error} Throws an error if the request fails.
     */
    async createRecipe(
        recipe: RecipeForCreatePayload,
        config?: RequestConfig
    ): Promise<RecipeDTO> {
        return await apiRequestWrapper.post({
            url: '/recipe',
            data: recipe,
            ...config
        });
    }

    /**
     * Rates a recipe by calling `POST /api/recipe/{id}/rate`.
     *
     * @param id - The ID of the recipe to rate.
     * @param rating - The rating to give to the recipe.
     * @param config - Optional fetch request configuration.
     */
    async rateRecipe(id: string, rating: number, config?: RequestConfig) {
        return await apiRequestWrapper.post({
            url: `/recipe/${id}/rate`,
            data: { rating },
            ...config
        });
    }
}

export const recipeApiClient = new RecipeApiClient();
