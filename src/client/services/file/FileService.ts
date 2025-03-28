import { apiService } from '@/client/services/ApiService';
import type { FileForUpload, FileUploadResponse } from '@/common/types';

class FileService {
    async uploadFile(
        data: FileForUpload,
        next?: NextFetchRequestConfig
    ): Promise<FileUploadResponse> {
        return await apiService.post({ url: '/file', data: data, next });
    }
}

export const fileService = new FileService();
