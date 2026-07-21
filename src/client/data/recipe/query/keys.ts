import type { Recipe } from '@/common/types';
import type {
    RecipeFilterParams,
    RecipeForCreatePayload,
    RecipeForDisplayDTO,
    RecipeRatingPayload,
    RecipeVisitPayload
} from '@/common/types';
import type {
    RecipeFlagAppealDTO,
    RecipeFlagAppealPayload
} from '@/common/types/flags/recipe-flag-appeal';
import type {
    UseQueryOptions,
    UseInfiniteQueryOptions,
    UseMutationOptions,
    QueryKey
} from '@tanstack/react-query';
import type { RequestError } from '@/client/error';

export type { RecipeFilterParams };

//~---------------------------------------------------------------------------------------------~//
//$                                            KEYS                                             $//
//~---------------------------------------------------------------------------------------------~//

const RECIPE_NAMESPACE_QUERY_KEY = 'recipe';

export const RECIPE_QUERY_KEYS = Object.freeze({
    namespace: RECIPE_NAMESPACE_QUERY_KEY,

    byDisplayId: (displayId: string) =>
        [RECIPE_NAMESPACE_QUERY_KEY, 'display', displayId] as const,

    byId: (id: string | number) =>
        [RECIPE_NAMESPACE_QUERY_KEY, 'id', id] as const,

    list: (batch: number, perPage: number) =>
        [RECIPE_NAMESPACE_QUERY_KEY, 'list', batch, perPage] as const,

    listInfinite: (perPage: number) =>
        [RECIPE_NAMESPACE_QUERY_KEY, 'list', perPage, 'infinite'] as const,

    search: (query: string, batch: number, perPage: number) =>
        [RECIPE_NAMESPACE_QUERY_KEY, 'search', query, batch, perPage] as const,

    searchInfinite: (query: string, perPage: number) =>
        [
            RECIPE_NAMESPACE_QUERY_KEY,
            'search',
            query,
            perPage,
            'infinite'
        ] as const,

    userRecipes: (userId: string, batch: number, perPage: number) =>
        [RECIPE_NAMESPACE_QUERY_KEY, 'user', userId, batch, perPage] as const,

    userRecipesInfinite: (userId: string, perPage: number) =>
        [
            RECIPE_NAMESPACE_QUERY_KEY,
            'user',
            userId,
            perPage,
            'infinite'
        ] as const,

    userSearchRecipes: (
        userId: string,
        query: string,
        batch: number,
        perPage: number
    ) =>
        [
            RECIPE_NAMESPACE_QUERY_KEY,
            'user',
            userId,
            'search',
            query,
            batch,
            perPage
        ] as const,

    userSearchRecipesInfinite: (
        userId: string,
        query: string,
        perPage: number
    ) =>
        [
            RECIPE_NAMESPACE_QUERY_KEY,
            'user',
            userId,
            'search',
            query,
            perPage,
            'infinite'
        ] as const,

    filter: (batch: number, perPage: number, filters: RecipeFilterParams) =>
        [
            RECIPE_NAMESPACE_QUERY_KEY,
            'filter',
            batch,
            perPage,
            filters
        ] as const,

    filterInfinite: (perPage: number, filters: RecipeFilterParams) =>
        [
            RECIPE_NAMESPACE_QUERY_KEY,
            'filter',
            perPage,
            filters,
            'infinite'
        ] as const
});

//~---------------------------------------------------------------------------------------------~//
//$                                         TYPES                                              $//
//~---------------------------------------------------------------------------------------------~//

export type RecipeByDisplayIdOptions = Omit<
    UseQueryOptions<
        Recipe,
        RequestError,
        Recipe,
        ReturnType<typeof RECIPE_QUERY_KEYS.byDisplayId>
    >,
    'queryKey' | 'queryFn'
>;

export type RecipeByIdOptions = Omit<
    UseQueryOptions<
        Recipe,
        RequestError,
        Recipe,
        ReturnType<typeof RECIPE_QUERY_KEYS.byId>
    >,
    'queryKey' | 'queryFn'
>;

export type RecipeListOptions = Omit<
    UseQueryOptions<
        RecipeForDisplayDTO[],
        RequestError,
        RecipeForDisplayDTO[],
        ReturnType<typeof RECIPE_QUERY_KEYS.list>
    >,
    'queryKey' | 'queryFn'
>;

export type RecipeListInfiniteOptions = Omit<
    UseInfiniteQueryOptions<
        RecipeForDisplayDTO[],
        RequestError,
        RecipeForDisplayDTO[],
        QueryKey,
        number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
>;

export type SearchRecipesOptions = Omit<
    UseQueryOptions<
        RecipeForDisplayDTO[],
        RequestError,
        RecipeForDisplayDTO[],
        ReturnType<typeof RECIPE_QUERY_KEYS.search>
    >,
    'queryKey' | 'queryFn'
>;

export type SearchRecipesInfiniteOptions = Omit<
    UseInfiniteQueryOptions<
        RecipeForDisplayDTO[],
        RequestError,
        RecipeForDisplayDTO[],
        QueryKey,
        number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
>;

export type UserRecipesOptions = Omit<
    UseQueryOptions<
        RecipeForDisplayDTO[],
        RequestError,
        RecipeForDisplayDTO[],
        ReturnType<typeof RECIPE_QUERY_KEYS.userRecipes>
    >,
    'queryKey' | 'queryFn'
>;

export type UserRecipesInfiniteOptions = Omit<
    UseInfiniteQueryOptions<
        RecipeForDisplayDTO[],
        RequestError,
        RecipeForDisplayDTO[],
        QueryKey,
        number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
>;

export type UserSearchRecipesOptions = Omit<
    UseQueryOptions<
        RecipeForDisplayDTO[],
        RequestError,
        RecipeForDisplayDTO[],
        ReturnType<typeof RECIPE_QUERY_KEYS.userSearchRecipes>
    >,
    'queryKey' | 'queryFn'
>;

export type UserSearchRecipesInfiniteOptions = Omit<
    UseInfiniteQueryOptions<
        RecipeForDisplayDTO[],
        RequestError,
        RecipeForDisplayDTO[],
        QueryKey,
        number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
>;

export type CreateRecipeOptions = Omit<
    UseMutationOptions<Recipe, RequestError, RecipeForCreatePayload>,
    'mutationFn'
>;

export type UpdateRecipeOptions = Omit<
    UseMutationOptions<
        Recipe,
        RequestError,
        { id: string; recipe: Partial<RecipeForCreatePayload> }
    >,
    'mutationFn'
>;

export type DeleteRecipeOptions = Omit<
    UseMutationOptions<unknown, RequestError, number>,
    'mutationFn'
>;

export type RateRecipeOptions = Omit<
    UseMutationOptions<unknown, RequestError, RecipeRatingPayload>,
    'mutationFn'
>;

export type RegisterRecipeVisitOptions = Omit<
    UseMutationOptions<void, RequestError, RecipeVisitPayload>,
    'mutationFn'
>;

export type FilterRecipesOptions = Omit<
    UseQueryOptions<
        RecipeForDisplayDTO[],
        RequestError,
        RecipeForDisplayDTO[],
        ReturnType<typeof RECIPE_QUERY_KEYS.filter>
    >,
    'queryKey' | 'queryFn'
>;

export type FilterRecipesInfiniteOptions = Omit<
    UseInfiniteQueryOptions<
        RecipeForDisplayDTO[],
        RequestError,
        RecipeForDisplayDTO[],
        QueryKey,
        number
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
>;

export type SubmitFlagAppealOptions = Omit<
    UseMutationOptions<
        RecipeFlagAppealDTO,
        RequestError,
        { recipeId: number } & RecipeFlagAppealPayload
    >,
    'mutationFn'
>;
