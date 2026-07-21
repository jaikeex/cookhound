import type { IngredientDTO } from '@/common/types';
import type { RequestConfig } from '@/client/request/apiClient/ApiRequestWrapper';
import { apiRequestWrapper } from '@/client/request/apiClient/ApiRequestWrapper';

/**
 * Service for ingredient related operations.
 */
class IngredientApiClient {
    /**
     * Gets list of all ingredients by calling `GET /api/ingredients`.
     *
     * @param config - Optional fetch request configuration.
     * @returns A promise that resolves to the list of ingredients.
     * @throws {Error} Throws an error if the request fails.
     */
    async getIngredients(config?: RequestConfig): Promise<IngredientDTO[]> {
        return await apiRequestWrapper.get({
            url: `/ingredients`,
            ...config
        });
    }
}

export const ingredientApiClient = new IngredientApiClient();
