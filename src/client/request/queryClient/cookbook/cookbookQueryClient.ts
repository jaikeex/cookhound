import {
    useAppQuery,
    useAppMutation
} from '@/client/request/queryClient/queryFactories';
import apiClient from '@/client/request/apiClient';
import {
    COOKBOOK_QUERY_KEYS,
    type CookbookByDisplayIdOptions,
    type CookbookByIdOptions,
    type UserCookbooksOptions,
    type CreateCookbookOptions,
    type DeleteCookbookOptions,
    type ReorderOwnCookbooksOptions,
    type AddRecipeToCookbookOptions,
    type RemoveRecipeFromCookbookOptions,
    type ReorderCookbookRecipesOptions
} from './types';

// This is fine (not a component, just declarations here).
/* eslint-disable react-hooks/rules-of-hooks */

class CookbookQueryClient {
    /** Fetch cookbook by numeric id. */
    useCookbookById = (
        id: string | number,
        options?: Partial<CookbookByIdOptions>
    ) =>
        useAppQuery(
            COOKBOOK_QUERY_KEYS.byId(id),
            () => apiClient.cookbook.getCookbookById(id),
            {
                enabled: Boolean(id),
                retry: 1,
                ...options
            }
        );

    /** Fetch cookbook by display uuid. */
    useCookbookByDisplayId = (
        displayId: string,
        options?: Partial<CookbookByDisplayIdOptions>
    ) =>
        useAppQuery(
            COOKBOOK_QUERY_KEYS.byDisplayId(displayId),
            () => apiClient.cookbook.getCookbookByDisplayId(displayId),
            {
                enabled: Boolean(displayId),
                retry: 1,
                ...options
            }
        );

    /** Fetch cookbooks by user */
    useCookbooksByUser = (
        userId: string | number,
        options?: Partial<UserCookbooksOptions>
    ) =>
        useAppQuery(
            COOKBOOK_QUERY_KEYS.byUser(userId),
            () => apiClient.cookbook.getCookbooksByUserId(userId),
            {
                enabled: Boolean(userId),
                retry: 1,
                ...options
            }
        );

    /** Create cookbook */
    useCreateCookbook = (options?: Partial<CreateCookbookOptions>) =>
        useAppMutation(apiClient.cookbook.createCookbook, options);

    /** Delete cookbook */
    useDeleteCookbook = (options?: Partial<DeleteCookbookOptions>) =>
        useAppMutation(apiClient.cookbook.deleteCookbook, options);

    /** Reorder own cookbooks */
    useReorderOwnCookbooks = (options?: Partial<ReorderOwnCookbooksOptions>) =>
        useAppMutation(apiClient.cookbook.reorderOwnCookbooks, options);

    /** Add recipe to cookbook */
    useAddRecipeToCookbook = (options?: Partial<AddRecipeToCookbookOptions>) =>
        useAppMutation(
            ({
                cookbookId,
                recipeId
            }: {
                cookbookId: number;
                recipeId: number;
            }) => apiClient.cookbook.addRecipeToCookbook(cookbookId, recipeId),
            options
        );

    /** Remove recipe from cookbook */
    useRemoveRecipeFromCookbook = (
        options?: Partial<RemoveRecipeFromCookbookOptions>
    ) =>
        useAppMutation(
            ({
                cookbookId,
                recipeId
            }: {
                cookbookId: number;
                recipeId: number;
            }) =>
                apiClient.cookbook.removeRecipeFromCookbook(
                    cookbookId,
                    recipeId
                ),
            options
        );

    /** Reorder recipes inside cookbook */
    useReorderCookbookRecipes = (
        options?: Partial<ReorderCookbookRecipesOptions>
    ) =>
        useAppMutation(
            ({
                cookbookId,
                orderedRecipeIds
            }: {
                cookbookId: number;
                orderedRecipeIds: number[];
            }) =>
                apiClient.cookbook.reorderCookbookRecipes(
                    cookbookId,
                    orderedRecipeIds
                ),
            options
        );
}

export const cookbookQueryClient = new CookbookQueryClient();
