import type { RequestConfig } from '@/client/request/apiClient/ApiRequestWrapper';
import { apiRequestWrapper } from '@/client/request/apiClient/ApiRequestWrapper';
import type { CookbookForCreatePayload, CookbookDTO } from '@/common/types';

/**
 * Service for cookbook-related operations.
 */
class CookbookApiClient {
    /**
     * Creates a new cookbook by calling `POST /api/cookbooks`.
     *
     * @param cookbook - The cookbook data for creation.
     * @param config - Optional fetch request configuration.
     * @returns A promise that resolves to the created cookbook.
     * @throws {Error} Throws an error if the request fails.
     */
    async createCookbook(
        cookbook: CookbookForCreatePayload,
        config?: RequestConfig
    ): Promise<CookbookDTO> {
        return await apiRequestWrapper.post({
            url: '/cookbooks',
            data: cookbook,
            ...config
        });
    }

    /**
     * Gets a cookbook by its internal id by calling `GET /api/cookbooks/{id}`.
     *
     * @param id - The ID of the cookbook to get.
     * @param config - Optional fetch request configuration.
     * @returns A promise that resolves to the cookbook.
     * @throws {Error} Throws an error if the request fails.
     */
    async getCookbookById(
        id: number | string,
        config?: RequestConfig
    ): Promise<CookbookDTO> {
        return await apiRequestWrapper.get({
            url: `/cookbooks/${id}`,
            ...config
        });
    }

    /**
     * Gets a cookbook by its display id by calling `GET /api/cookbooks/display/{displayId}`.
     *
     * @param displayId - The display ID of the cookbook to get.
     * @param config - Optional fetch request configuration.
     * @returns A promise that resolves to the cookbook.
     * @throws {Error} Throws an error if the request fails.
     */
    async getCookbookByDisplayId(
        displayId: string,
        config?: RequestConfig
    ): Promise<CookbookDTO> {
        return await apiRequestWrapper.get({
            url: `/cookbooks/display/${displayId}`,
            ...config
        });
    }

    /**
     * Returns cookbooks by user id by calling `GET /api/cookbooks/user/{userId}`.
     *
     * @param userId - The ID of the user to get cookbooks for.
     * @param config - Optional fetch request configuration.
     * @returns A promise that resolves to the cookbooks.
     * @throws {Error} Throws an error if the request fails.
     */
    async getCookbooksByUserId(
        userId: number | string,
        config?: RequestConfig
    ): Promise<CookbookDTO[]> {
        return await apiRequestWrapper.get({
            url: `/cookbooks/user/${userId}`,
            ...config
        });
    }

    /**
     * Deletes a cookbook by calling `DELETE /api/cookbooks/{id}`.
     *
     * @param id - The ID of the cookbook to delete.
     * @param config - Optional fetch request configuration.
     * @throws {Error} Throws an error if the request fails.
     */
    async deleteCookbook(id: number | string, config?: RequestConfig) {
        await apiRequestWrapper.delete({
            url: `/cookbooks/${id}`,
            ...config
        });
    }

    /**
     * Reorders cookbooks owned by the current user by calling `PUT /api/cookbooks/me`.
     *
     * @param orderedCookbookIds - The IDs of the cookbooks to reorder.
     * @param config - Optional fetch request configuration.
     * @throws {Error} Throws an error if the request fails.
     */
    async reorderOwnCookbooks(
        orderedCookbookIds: number[],
        config?: RequestConfig
    ) {
        await apiRequestWrapper.put({
            url: '/cookbooks/me',
            data: { orderedCookbookIds },
            ...config
        });
    }

    /**
     * Adds a recipe to a cookbook by calling `POST /api/cookbooks/{cookbookId}/recipe`.
     *
     * @param cookbookId - The ID of the cookbook to add the recipe to.
     * @param recipeId - The ID of the recipe to add.
     * @param config - Optional fetch request configuration.
     * @throws {Error} Throws an error if the request fails.
     */
    async addRecipeToCookbook(
        cookbookId: number,
        recipeId: number,
        config?: RequestConfig
    ) {
        await apiRequestWrapper.post({
            url: `/cookbooks/${cookbookId}/recipe`,
            data: { recipeId },
            ...config
        });
    }

    /**
     * Removes a recipe from a cookbook by calling `DELETE /api/cookbooks/{cookbookId}/recipe`.
     *
     * @param cookbookId - The ID of the cookbook to remove the recipe from.
     * @param recipeId - The ID of the recipe to remove.
     * @param config - Optional fetch request configuration.
     * @throws {Error} Throws an error if the request fails.
     */
    async removeRecipeFromCookbook(
        cookbookId: number,
        recipeId: number,
        config?: RequestConfig
    ) {
        await apiRequestWrapper.delete({
            url: `/cookbooks/${cookbookId}/recipe`,
            data: { recipeId },
            ...config
        });
    }

    /**
     * Reorders recipes inside a cookbook by calling `PUT /api/cookbooks/{cookbookId}/recipe`.
     *
     * @param cookbookId - The ID of the cookbook to reorder the recipes for.
     * @param orderedRecipeIds - The IDs of the recipes to reorder.
     * @param config - Optional fetch request configuration.
     * @throws {Error} Throws an error if the request fails.
     */
    async reorderCookbookRecipes(
        cookbookId: number,
        orderedRecipeIds: number[],
        config?: RequestConfig
    ) {
        await apiRequestWrapper.put({
            url: `/cookbooks/${cookbookId}/recipe`,
            data: { orderedRecipeIds },
            ...config
        });
    }
}

export const cookbookApiClient = new CookbookApiClient();
