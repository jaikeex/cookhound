import { useAppMutation } from '@/client/request/queryClient/queryFactories';
import apiClient from '@/client/request/apiClient';
import type { UploadRecipeImageOptions } from './types';

class FileQueryClient {
    /**
     * Uploads a recipe image.
     */
    useUploadRecipeImage = (options?: Partial<UploadRecipeImageOptions>) =>
        useAppMutation(apiClient.file.uploadRecipeImage, options);
}

export const fileQueryClient = new FileQueryClient();
