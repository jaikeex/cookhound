'use client';

import { fileApiClient } from '@/client/request/apiClient/file';
import type { FileRepository } from '@/client/data/file/port';

/**
 * HTTP-backed implementation of {@link FileRepository}.
 */
export const httpFileRepository: FileRepository = {
    uploadRecipeImage: (data) => fileApiClient.uploadRecipeImage(data),

    uploadAvatarImage: (data) => fileApiClient.uploadAvatarImage(data)
};
