'use client';

import { fileApiClient } from '@/client/request/apiClient/file';
import type { FileRepository } from '@/client/data/file/port';

/**
 * HTTP-backed implementation of {@link FileRepository}.
 *
 * File uploads return a plain {@link FileUploadResponse} (just an object URL),
 * so there is no DTO→domain mapping to perform here. The adapter exists to
 * preserve the seam — tests can swap it for an in-memory fake without
 * touching components or query hooks.
 */
export const httpFileRepository: FileRepository = {
    uploadRecipeImage: (data) => fileApiClient.uploadRecipeImage(data),

    uploadAvatarImage: (data) => fileApiClient.uploadAvatarImage(data)
};
