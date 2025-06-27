import type { RequestConfig } from '@/client/request/ApiRequestWrapper';
import { apiRequestWrapper } from '@/client/request/ApiRequestWrapper';
import type { FileForUpload, FileUploadResponse } from '@/common/types';

/**
 * Service for file-related operations.
 */
class FileApiClient {
    /**
     * Uploads a file by calling `POST /api/file`.
     *
     * @param data - The file data to upload.
     * @param config - Optional fetch request configuration.
     * @returns A promise that resolves to the file upload response.
     * @throws {Error} Throws an error if the request fails.
     */
    async uploadRecipeImage(
        data: FileForUpload,
        config?: RequestConfig
    ): Promise<FileUploadResponse> {
        return await apiRequestWrapper.post({
            url: '/file/recipe-img',
            data: data,
            ...config
        });
    }
}

export const fileApiClient = new FileApiClient();
