import { apiRequestWrapper } from '@/client/request/ApiRequestWrapper';
import type { FileForUpload, FileUploadResponse } from '@/common/types';

class FileApiClient {
    async uploadFile(
        data: FileForUpload,
        next?: NextFetchRequestConfig
    ): Promise<FileUploadResponse> {
        return await apiRequestWrapper.post({ url: '/file', data: data, next });
    }
}

export const fileApiClient = new FileApiClient();
