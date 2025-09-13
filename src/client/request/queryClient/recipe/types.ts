import type { Locale } from '@/client/locales';
import type {
    RecipeDTO,
    RecipeForCreatePayload,
    RecipeForDisplayDTO,
    RecipeRatingPayload,
    RecipeVisitPayload
} from '@/common/types';
import type {
    UseQueryOptions,
    UseInfiniteQueryOptions,
    UseMutationOptions,
    QueryKey
} from '@tanstack/react-query';
import type { RequestError } from '@/client/error';

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

    list: (language: Locale, batch: number, perPage: number) =>
        [RECIPE_NAMESPACE_QUERY_KEY, 'list', language, batch, perPage] as const,

    listInfinite: (language: Locale, perPage: number) =>
        [
            RECIPE_NAMESPACE_QUERY_KEY,
            'list',
            language,
            perPage,
            'infinite'
        ] as const,

    search: (query: string, language: Locale, batch: number, perPage: number) =>
        [
            RECIPE_NAMESPACE_QUERY_KEY,
            'search',
            query,
            language,
            batch,
            perPage
        ] as const,

    searchInfinite: (query: string, language: Locale, perPage: number) =>
        [
            RECIPE_NAMESPACE_QUERY_KEY,
            'search',
            query,
            language,
            perPage,
            'infinite'
        ] as const,

    userRecipes: (
        userId: string,
        language: Locale,
        batch: number,
        perPage: number
    ) =>
        [
            RECIPE_NAMESPACE_QUERY_KEY,
            'user',
            userId,
            language,
            batch,
            perPage
        ] as const,

    userRecipesInfinite: (userId: string, language: Locale, perPage: number) =>
        [
            RECIPE_NAMESPACE_QUERY_KEY,
            'user',
            userId,
            language,
            perPage,
            'infinite'
        ] as const,

    userSearchRecipes: (
        userId: string,
        query: string,
        language: Locale,
        batch: number,
        perPage: number
    ) =>
        [
            RECIPE_NAMESPACE_QUERY_KEY,
            'user',
            userId,
            'search',
            query,
            language,
            batch,
            perPage
        ] as const,

    userSearchRecipesInfinite: (
        userId: string,
        query: string,
        language: Locale,
        perPage: number
    ) =>
        [
            RECIPE_NAMESPACE_QUERY_KEY,
            'user',
            userId,
            'search',
            query,
            language,
            perPage,
            'infinite'
        ] as const
});

//~---------------------------------------------------------------------------------------------~//
//$                                         TYPES                                              $//
//~---------------------------------------------------------------------------------------------~//

export type RecipeByDisplayIdOptions = Omit<
    UseQueryOptions<
        RecipeDTO,
        RequestError,
        RecipeDTO,
        ReturnType<typeof RECIPE_QUERY_KEYS.byDisplayId>
    >,
    'queryKey' | 'queryFn'
>;

export type RecipeByIdOptions = Omit<
    UseQueryOptions<
        RecipeDTO,
        RequestError,
        RecipeDTO,
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
    UseMutationOptions<RecipeDTO, RequestError, RecipeForCreatePayload>,
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
