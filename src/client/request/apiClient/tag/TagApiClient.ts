import { apiRequestWrapper } from '@/client/request/apiClient/ApiRequestWrapper';
import type { RequestConfig } from '@/client/request/apiClient/ApiRequestWrapper';
import type { TagListDTO } from '@/common/types';

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
        language: string,
        config?: RequestConfig
    ): Promise<TagListDTO[]> {
        return await apiRequestWrapper.get({
            url: `/recipes/tags?lang=${language}`,
            ...config
        });
    }
}

export const tagApiClient = new TagApiClient();
