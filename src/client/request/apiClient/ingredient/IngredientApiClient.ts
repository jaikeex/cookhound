import type { Locale, IngredientDTO } from '@/common/types';
import type { RequestConfig } from '@/client/request/apiClient/ApiRequestWrapper';
import { apiRequestWrapper } from '@/client/request/apiClient/ApiRequestWrapper';

/**
 * Service for ingredient related operations.
 */
class IngredientApiClient {
    /**
     * Gets list of all ingredients for the given language
     * by calling `GET /api/ingredients`.
     *
     * @param language - The locale to fetch ingredients for.
     * @param config - Optional fetch request configuration.
     * @returns A promise that resolves to the list of ingredients.
     * @throws {Error} Throws an error if the request fails.
     */
    async getIngredients(
        language: Locale,
        config?: RequestConfig
    ): Promise<IngredientDTO[]> {
        return await apiRequestWrapper.get({
            url: `/ingredients`,
            params: { language },
            ...config
        });
    }
}

export const ingredientApiClient = new IngredientApiClient();
