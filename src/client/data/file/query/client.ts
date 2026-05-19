import { useAppMutation } from '@/client/data/queryFactories';
import { useRepositories } from '@/client/data';
import type {
    UploadAvatarImageOptions,
    UploadRecipeImageOptions
} from './keys';

export const fileQueryClient = {
    useUploadRecipeImage: (options?: Partial<UploadRecipeImageOptions>) => {
        const { fileRepository } = useRepositories();

        return useAppMutation(fileRepository.uploadRecipeImage, options);
    },

    useUploadAvatarImage: (options?: Partial<UploadAvatarImageOptions>) => {
        const { fileRepository } = useRepositories();

        return useAppMutation(fileRepository.uploadAvatarImage, options);
    }
};
