import {
    useAppMutation,
    useAppQuery
} from '@/client/request/queryClient/queryFactories';
import { useRepositories } from '@/client/data';
import {
    COOKBOOK_QUERY_KEYS,
    type AddRecipeToCookbookOptions,
    type CookbookByDisplayIdOptions,
    type CookbookByIdOptions,
    type CreateCookbookOptions,
    type DeleteCookbookOptions,
    type RemoveRecipeFromCookbookOptions,
    type ReorderCookbookRecipesOptions,
    type ReorderOwnCookbooksOptions,
    type UserCookbooksOptions
} from './keys';

export const cookbookQueryClient = {
    //~=========================================================================================~//
    //$                                          READS                                          $//
    //~=========================================================================================~//

    /** Fetch cookbook by numeric id. */
    useCookbookById: (
        id: string | number,
        options?: Partial<CookbookByIdOptions>
    ) => {
        const { cookbookRepository } = useRepositories();

        return useAppQuery(
            COOKBOOK_QUERY_KEYS.byId(id),
            ({ signal }) => cookbookRepository.getById({ id, signal }),
            {
                enabled: Boolean(id),
                retry: 1,
                ...options
            }
        );
    },

    /** Fetch cookbook by display uuid. */
    useCookbookByDisplayId: (
        displayId: string,
        options?: Partial<CookbookByDisplayIdOptions>
    ) => {
        const { cookbookRepository } = useRepositories();

        return useAppQuery(
            COOKBOOK_QUERY_KEYS.byDisplayId(displayId),
            ({ signal }) =>
                cookbookRepository.getByDisplayId({ displayId, signal }),
            {
                enabled: Boolean(displayId),
                retry: 1,
                ...options
            }
        );
    },

    /** Fetch cookbooks by user. */
    useCookbooksByUser: (
        userId: string | number,
        options?: Partial<UserCookbooksOptions>
    ) => {
        const { cookbookRepository } = useRepositories();

        return useAppQuery(
            COOKBOOK_QUERY_KEYS.byUser(userId),
            ({ signal }) => cookbookRepository.listByUser({ userId, signal }),
            {
                enabled: Boolean(userId),
                retry: 1,
                ...options
            }
        );
    },

    //~=========================================================================================~//
    //$                                        MUTATIONS                                        $//
    //~=========================================================================================~//

    /** Create cookbook. */
    useCreateCookbook: (options?: Partial<CreateCookbookOptions>) => {
        const { cookbookRepository } = useRepositories();

        return useAppMutation(cookbookRepository.create, options);
    },

    /** Delete cookbook. */
    useDeleteCookbook: (options?: Partial<DeleteCookbookOptions>) => {
        const { cookbookRepository } = useRepositories();

        return useAppMutation(cookbookRepository.delete, options);
    },

    /** Reorder cookbooks owned by the current user. */
    useReorderOwnCookbooks: (options?: Partial<ReorderOwnCookbooksOptions>) => {
        const { cookbookRepository } = useRepositories();

        return useAppMutation(cookbookRepository.reorderOwn, options);
    },

    /** Add a recipe to a cookbook. */
    useAddRecipeToCookbook: (options?: Partial<AddRecipeToCookbookOptions>) => {
        const { cookbookRepository } = useRepositories();

        return useAppMutation(cookbookRepository.addRecipe, options);
    },

    /** Remove a recipe from a cookbook. */
    useRemoveRecipeFromCookbook: (
        options?: Partial<RemoveRecipeFromCookbookOptions>
    ) => {
        const { cookbookRepository } = useRepositories();

        return useAppMutation(cookbookRepository.removeRecipe, options);
    },

    /** Reorder recipes inside a cookbook. */
    useReorderCookbookRecipes: (
        options?: Partial<ReorderCookbookRecipesOptions>
    ) => {
        const { cookbookRepository } = useRepositories();

        return useAppMutation(cookbookRepository.reorderRecipes, options);
    }
};
