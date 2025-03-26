import { apiService } from '@/client/services/ApiService';
import type { FileForUpload } from '@/client/services/file/types';
import type { FileUploadResponse } from '@/client/services/file/types';

class FileService {
    async uploadFile(
        data: FileForUpload,
        next?: NextFetchRequestConfig
    ): Promise<FileUploadResponse> {
        return await apiService.post({ url: '/file', data: data, next });
    }
}

export const fileService = new FileService();
