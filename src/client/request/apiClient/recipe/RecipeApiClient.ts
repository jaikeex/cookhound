import type { Locale } from '@/common/types';
import type { RequestConfig } from '@/client/request/apiClient/ApiRequestWrapper';
import { apiRequestWrapper } from '@/client/request/apiClient/ApiRequestWrapper';
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
     * Registers a recipe visit by calling `POST /api/recipes/{id}/visits`.
     *
     * @param id - The ID of the recipe to visit.
     * @param userId - The ID of the user to visit the recipe.
     * @param config - Optional fetch request configuration.
     */
    async registerRecipeVisit(
        id: string,
        userId: string | null,
        config?: RequestConfig
    ): Promise<void> {
        return await apiRequestWrapper.post({
            url: `/recipes/${id}/visits`,
            data: { userId },
            ...config
        });
    }

    /**
     * Gets a recipe by its display ID by calling `GET /api/recipes/display/{displayId}`.
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
            url: `/recipes/display/${displayId}`,
            ...config
        });
    }

    /**
     * Gets a recipe by its ID by calling `GET /api/recipes/{id}`.
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
            url: `/recipes/${id}`,
            ...config
        });
    }

    /**
     * Gets a paginated list of recipes by calling `GET /api/recipes`.
     *
     * @param language - The language of the recipes to fetch.
     * @param batch - The batch number to fetch.
     * @param perPage - The number of recipes per page.
     * @param config - Optional fetch request configuration.
     * @returns A promise that resolves to the paginated list of recipes.
     * @throws {Error} Throws an error if the request fails.
     */
    async getRecipeList(
        language: Locale,
        batch: number,
        perPage: number,
        config?: RequestConfig
    ): Promise<RecipeForDisplayDTO[]> {
        return await apiRequestWrapper.get({
            url: `/recipes`,
            params: { language, batch, perPage },
            ...config
        });
    }

    /**
     * Searches for recipes by calling `GET /api/recipes/search`.
     *
     * @param query - The query to search for.
     * @param language - The language of the recipes to search for.
     * @param batch - The batch number to fetch.
     * @param perPage - The number of recipes per page.
     * @param config - Optional fetch request configuration.
     * @returns A promise that resolves to the search results.
     * @throws {Error} Throws an error if the request fails.
     */
    async searchRecipes(
        query: string,
        language: Locale,
        batch: number,
        perPage: number,
        config?: RequestConfig
    ): Promise<RecipeForDisplayDTO[]> {
        return await apiRequestWrapper.get({
            url: `/recipes/search`,
            params: { query, language, batch, perPage },
            ...config
        });
    }

    /**
     * Gets a paginated list of recipes by user by calling `GET /api/recipes/user/{userId}`.
     *
     * @param userId - The ID of the user to fetch recipes for.
     * @param language - The language of the recipes to fetch.
     * @param batch - The batch number to fetch.
     * @param perPage - The number of recipes per page.
     * @param config - Optional fetch request configuration.
     * @returns A promise that resolves to the paginated list of recipes.
     * @throws {Error} Throws an error if the request fails.
     */
    async getUserRecipes(
        userId: string,
        language: Locale,
        batch: number,
        perPage: number,
        config?: RequestConfig
    ): Promise<RecipeForDisplayDTO[]> {
        return await apiRequestWrapper.get({
            url: `/recipes/user/${userId}`,
            params: { language, batch, perPage },
            ...config
        });
    }

    /**
     * Searches for recipes by user by calling `GET /api/recipes/user/{userId}/search`.
     *
     * @param userId - The ID of the user to search for.
     * @param query - The query to search for.
     * @param language - The language of the recipes to search for.
     * @param batch - The batch number to fetch.
     * @param perPage - The number of recipes per page.
     * @param config - Optional fetch request configuration.
     * @returns A promise that resolves to the search results.
     * @throws {Error} Throws an error if the request fails.
     */
    async searchUserRecipes(
        userId: string,
        query: string,
        language: Locale,
        batch: number,
        perPage: number,
        config?: RequestConfig
    ): Promise<RecipeForDisplayDTO[]> {
        return await apiRequestWrapper.get({
            url: `/recipes/user/${userId}/search`,
            params: { query, language, batch, perPage },
            ...config
        });
    }

    /**
     * Creates a new recipe by calling `POST /api/recipes`.
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
            url: '/recipes',
            data: recipe,
            ...config
        });
    }

    /**
     * Updates a recipe by calling `PUT /api/recipes/{id}`.
     *
     * @param id - The ID of the recipe to update.
     * @param recipe - The recipe data for update.
     * @param config - Optional fetch request configuration.
     */
    async updateRecipe(
        id: string,
        recipe: Partial<RecipeForCreatePayload>,
        config?: RequestConfig
    ): Promise<RecipeDTO> {
        return await apiRequestWrapper.put({
            url: `/recipes/${id}`,
            data: recipe,
            ...config
        });
    }

    /**
     * Deletes a recipe by calling `DELETE /api/recipes/{id}`.
     *
     * @param id - The ID of the recipe to delete.
     * @param config - Optional fetch request configuration.
     */
    async deleteRecipe(id: number, config?: RequestConfig) {
        return await apiRequestWrapper.delete({
            url: `/recipes/${id}`,
            ...config
        });
    }

    /**
     * Rates a recipe by calling `POST /api/recipes/{id}/ratings`.
     *
     * @param id - The ID of the recipe to rate.
     * @param rating - The rating to give to the recipe.
     * @param config - Optional fetch request configuration.
     */
    async rateRecipe(id: string, rating: number, config?: RequestConfig) {
        return await apiRequestWrapper.post({
            url: `/recipes/${id}/ratings`,
            data: { rating },
            ...config
        });
    }
}

export const recipeApiClient = new RecipeApiClient();
