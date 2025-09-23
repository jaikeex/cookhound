import type { Locale } from '@/common/types';
import { apiRequestWrapper } from '@/client/request/apiClient/ApiRequestWrapper';
import type { RequestConfig } from '@/client/request/apiClient/ApiRequestWrapper';
import type { RecipeDTO, TagListDTO, RecipeTagDTO } from '@/common/types';

class TagApiClient {
    /**
     * Gets the tags by calling `GET /api/recipes/tags`.
     *
     * @param config - Optional fetch request configuration.
     * @returns A promise that resolves when the tags are fetched.
     * - 200: Success, with the tags.
     *
     * @throws {Error} Throws an error if the request fails.
     * - 500: Internal Server Error, if there is an error during the request.
     */
    async getTags(
        language: Locale,
        config?: RequestConfig
    ): Promise<TagListDTO[]> {
        return await apiRequestWrapper.get({
            url: `/recipes/tags?lang=${language}`,
            ...config
        });
    }

    /**
     * Gets the suggestions for tags by calling `POST /api/recipes/tags/suggestions`.
     *
     * @param recipe - The recipe to get suggestions for.
     * @param config - Optional fetch request configuration.
     * @returns A promise that resolves when the suggestions are fetched.
     * - 200: Success, with the suggestions.
     *
     * @throws {Error} Throws an error if the request fails.
     * - 500: Internal Server Error, if there is an error during the request.
     */
    async getSuggestions(
        recipe: RecipeDTO,
        config?: RequestConfig
    ): Promise<RecipeTagDTO[]> {
        return await apiRequestWrapper.post({
            url: `/recipes/tags/suggestions`,
            data: recipe,
            ...config
        });
    }
}

export const tagApiClient = new TagApiClient();
