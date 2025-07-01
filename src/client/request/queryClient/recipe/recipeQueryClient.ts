import type { Locale } from '@/client/locales';
import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import {
    useAppQuery,
    useAppMutation
} from '@/client/request/queryClient/queryFactories';
import apiClient from '@/client/request/apiClient';
import type {
    RecipeByDisplayIdOptions,
    RecipeByIdOptions,
    RecipeListOptions,
    RecipeListInfiniteOptions,
    SearchRecipesOptions,
    SearchRecipesInfiniteOptions,
    CreateRecipeOptions,
    RateRecipeOptions,
    RegisterRecipeVisitOptions
} from './types';
import { RECIPE_QUERY_KEYS } from './types';

class RecipeQueryClient {
    /**
     * Fetches a recipe by its display id.
     *
     * Key: RECIPE_QUERY_KEYS.byDisplayId(displayId)
     * Stale time: default
     * Retry: 1
     *
     * @param displayId - The display id of the recipe.
     */
    useRecipeByDisplayId = (
        displayId: string,
        options?: Partial<RecipeByDisplayIdOptions>
    ) =>
        useAppQuery(
            RECIPE_QUERY_KEYS.byDisplayId(displayId),
            () => apiClient.recipe.getRecipeByDisplayId(displayId),
            {
                enabled: Boolean(displayId),
                retry: 1,
                ...options
            }
        );

    /**
     * Fetches a recipe by its internal numeric id.
     *
     * Key: RECIPE_QUERY_KEYS.byId(id)
     * Stale time: default
     * Retry: 1
     *
     * @param id - The id of the recipe.
     */
    useRecipeById = (
        id: string | number,
        options?: Partial<RecipeByIdOptions>
    ) =>
        useAppQuery(
            RECIPE_QUERY_KEYS.byId(id),
            () => apiClient.recipe.getRecipeById(String(id)),
            {
                enabled: Boolean(id),
                retry: 1,
                ...options
            }
        );

    /**
     * Returns paginated list of recipes (non-infinite).
     *
     * Key: RECIPE_QUERY_KEYS.list(language, batch, perPage)
     * Stale time: default
     * Retry: 1
     * Placeholder data: Keep previous
     *
     * @param language - The language of the recipes.
     * @param batch - The batch of the recipes.
     * @param perPage - The number of recipes per page.
     */
    useRecipeList = (
        language: Locale,
        batch: number,
        perPage: number,
        options?: Partial<RecipeListOptions>
    ) =>
        useAppQuery(
            RECIPE_QUERY_KEYS.list(language, batch, perPage),
            () => apiClient.recipe.getRecipeList(language, batch, perPage),
            {
                enabled: Boolean(language && batch > 0 && perPage),
                retry: 1,
                placeholderData: keepPreviousData,
                ...options
            }
        );

    /**
     * Returns paginated list of recipes (infinite).
     *
     * Key: RECIPE_QUERY_KEYS.listInfinite(language, perPage)
     * Stale time: default
     *
     * @param language - The language of the recipes.
     * @param perPage - The number of recipes per page.
     * @param maxBatches - The maximum number of batches to fetch.
     */
    useRecipeListInfinite = (
        language: Locale,
        perPage: number,
        maxBatches?: number,
        options?: Partial<RecipeListInfiniteOptions>
    ) =>
        useInfiniteQuery({
            queryKey: [...RECIPE_QUERY_KEYS.listInfinite(language, perPage)],
            initialPageParam: 1,
            queryFn: ({ pageParam }) =>
                apiClient.recipe.getRecipeList(
                    language,
                    Number(pageParam ?? 1),
                    perPage
                ),
            getNextPageParam: (lastPage, allPages) => {
                if (lastPage.length < perPage) return null;
                if (maxBatches !== undefined && allPages.length >= maxBatches)
                    return null;
                return allPages.length + 1;
            },
            enabled: Boolean(language && perPage),
            ...options
        });

    /**
     * Searches for recipes (non-infinite).
     *
     * Key: RECIPE_QUERY_KEYS.search(query, language, batch, perPage)
     * Stale time: default
     * Retry: 1
     * Placeholder data: Keep previous
     *
     * @param query - The query to search for.
     * @param language - The language of the recipes.
     * @param batch - The batch of the recipes.
     * @param perPage - The number of recipes per page.
     */
    useSearchRecipes = (
        query: string,
        language: Locale,
        batch: number,
        perPage: number,
        options?: Partial<SearchRecipesOptions>
    ) =>
        useAppQuery(
            RECIPE_QUERY_KEYS.search(query, language, batch, perPage),
            () =>
                apiClient.recipe.searchRecipes(query, language, batch, perPage),
            {
                enabled: Boolean(query && language && batch > 0 && perPage),
                retry: 1,
                placeholderData: keepPreviousData,
                ...options
            }
        );

    /**
     * Searches for recipes (infinite).
     *
     * Key: RECIPE_QUERY_KEYS.searchInfinite(query, language, perPage)
     * Stale time: default
     *
     * @param query - The query to search for.
     * @param language - The language of the recipes.
     * @param perPage - The number of recipes per page.
     * @param maxBatches - The maximum number of batches to fetch.
     */
    useSearchRecipesInfinite = (
        query: string,
        language: Locale,
        perPage: number,
        maxBatches?: number,
        options?: Partial<SearchRecipesInfiniteOptions>
    ) =>
        useInfiniteQuery({
            queryKey: [
                ...RECIPE_QUERY_KEYS.searchInfinite(query, language, perPage)
            ],
            initialPageParam: 1,
            queryFn: ({ pageParam }) =>
                apiClient.recipe.searchRecipes(
                    query,
                    language,
                    Number(pageParam ?? 1),
                    perPage
                ),
            getNextPageParam: (lastPage, allPages) => {
                if (lastPage.length < perPage) return null;
                if (maxBatches !== undefined && allPages.length >= maxBatches)
                    return null;
                return allPages.length + 1;
            },
            enabled: Boolean(query && language && perPage),
            ...options
        });

    /**
     * Creates a new recipe.
     */
    useCreateRecipe = (options?: Partial<CreateRecipeOptions>) =>
        useAppMutation(apiClient.recipe.createRecipe, options);

    /**
     * Rates a recipe.
     */
    useRateRecipe = (options?: Partial<RateRecipeOptions>) =>
        useAppMutation(
            ({ id, rating }: { id: string; rating: number }) =>
                apiClient.recipe.rateRecipe(id, rating),
            options
        );

    /**
     * Registers a recipe visit.
     */
    useRegisterRecipeVisit = (options?: Partial<RegisterRecipeVisitOptions>) =>
        useAppMutation(
            ({ id, userId }: { id: string; userId: string | null }) =>
                apiClient.recipe.registerRecipeVisit(id, userId),
            options
        );
}

export const recipeQueryClient = new RecipeQueryClient();
