import type { FileForUpload, FileUploadResponse } from '@/common/types';

/**
 * Domain port for file upload operations.
 */
export interface FileRepository {
    uploadRecipeImage(data: FileForUpload): Promise<FileUploadResponse>;

    uploadAvatarImage(data: FileForUpload): Promise<FileUploadResponse>;
}
