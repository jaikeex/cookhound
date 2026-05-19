import type { Cookbook, CookbookForCreatePayload } from '@/common/types';
import type {
    UseQueryOptions,
    UseMutationOptions
} from '@tanstack/react-query';
import type { RequestError } from '@/client/error';

//~---------------------------------------------------------------------------------------------~//
//$                                            KEYS                                             $//
//~---------------------------------------------------------------------------------------------~//

const COOKBOOK_NAMESPACE_QUERY_KEY = 'cookbook';

export const COOKBOOK_QUERY_KEYS = Object.freeze({
    namespace: COOKBOOK_NAMESPACE_QUERY_KEY,

    byId: (id: string | number) =>
        [COOKBOOK_NAMESPACE_QUERY_KEY, 'id', id] as const,

    byDisplayId: (displayId: string) =>
        [COOKBOOK_NAMESPACE_QUERY_KEY, 'display', displayId] as const,

    byUser: (userId: string | number) =>
        [COOKBOOK_NAMESPACE_QUERY_KEY, 'user', userId] as const
});

//~---------------------------------------------------------------------------------------------~//
//$                                            TYPES                                            $//
//~---------------------------------------------------------------------------------------------~//

export type CookbookByIdOptions = Omit<
    UseQueryOptions<
        Cookbook,
        RequestError,
        Cookbook,
        ReturnType<typeof COOKBOOK_QUERY_KEYS.byId>
    >,
    'queryKey' | 'queryFn'
>;

export type CookbookByDisplayIdOptions = Omit<
    UseQueryOptions<
        Cookbook,
        RequestError,
        Cookbook,
        ReturnType<typeof COOKBOOK_QUERY_KEYS.byDisplayId>
    >,
    'queryKey' | 'queryFn'
>;

export type UserCookbooksOptions = Omit<
    UseQueryOptions<
        Cookbook[],
        RequestError,
        Cookbook[],
        ReturnType<typeof COOKBOOK_QUERY_KEYS.byUser>
    >,
    'queryKey' | 'queryFn'
>;

export type CreateCookbookOptions = Omit<
    UseMutationOptions<
        Cookbook,
        RequestError,
        { input: CookbookForCreatePayload }
    >,
    'mutationFn'
>;

export type DeleteCookbookOptions = Omit<
    UseMutationOptions<void, RequestError, { id: number | string }>,
    'mutationFn'
>;

export type ReorderOwnCookbooksOptions = Omit<
    UseMutationOptions<void, RequestError, { orderedCookbookIds: number[] }>,
    'mutationFn'
>;

export type AddRecipeToCookbookOptions = Omit<
    UseMutationOptions<
        void,
        RequestError,
        { cookbookId: number; recipeId: number }
    >,
    'mutationFn'
>;

export type RemoveRecipeFromCookbookOptions = AddRecipeToCookbookOptions;

export type ReorderCookbookRecipesOptions = Omit<
    UseMutationOptions<
        void,
        RequestError,
        { cookbookId: number; orderedRecipeIds: number[] }
    >,
    'mutationFn'
>;
