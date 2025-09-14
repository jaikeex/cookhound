import { useAppMutation } from '@/client/request/queryClient/queryFactories';
import apiClient from '@/client/request/apiClient';
import type {
    UploadAvatarImageOptions,
    UploadRecipeImageOptions
} from './types';

class FileQueryClient {
    /**
     * Uploads a recipe image.
     */
    useUploadRecipeImage = (options?: Partial<UploadRecipeImageOptions>) =>
        useAppMutation(apiClient.file.uploadRecipeImage, options);

    /**
     * Uploads a avatar image.
     */
    useUploadAvatarImage = (options?: Partial<UploadAvatarImageOptions>) =>
        useAppMutation(apiClient.file.uploadAvatarImage, options);
}

export const fileQueryClient = new FileQueryClient();
