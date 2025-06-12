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
     * @param next - Optional Next.js fetch request configuration.
     * @returns A promise that resolves to the file upload response.
     * @throws {Error} Throws an error if the request fails.
     */
    async uploadFile(
        data: FileForUpload,
        next?: NextFetchRequestConfig
    ): Promise<FileUploadResponse> {
        return await apiRequestWrapper.post({ url: '/file', data: data, next });
    }

    /**
     * Uploads a file by calling `POST /api/file`.
     *
     * @param data - The file data to upload.
     * @param next - Optional Next.js fetch request configuration.
     * @returns A promise that resolves to the file upload response.
     * @throws {Error} Throws an error if the request fails.
     */
    async uploadRecipeImage(
        data: FileForUpload,
        next?: NextFetchRequestConfig
    ): Promise<FileUploadResponse> {
        return await apiRequestWrapper.post({
            url: '/file/recipe-img',
            data: data,
            next
        });
    }
}

export const fileApiClient = new FileApiClient();
