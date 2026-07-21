import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { useAppQuery, useAppMutation } from '@/client/data/queryFactories';
import { useRepositories } from '@/client/data';
import {
    RECIPE_QUERY_KEYS,
    type RecipeByDisplayIdOptions,
    type RecipeByIdOptions,
    type RecipeListOptions,
    type RecipeListInfiniteOptions,
    type SearchRecipesOptions,
    type SearchRecipesInfiniteOptions,
    type CreateRecipeOptions,
    type RateRecipeOptions,
    type RegisterRecipeVisitOptions,
    type UserSearchRecipesOptions,
    type UserRecipesOptions,
    type UserSearchRecipesInfiniteOptions,
    type UserRecipesInfiniteOptions,
    type DeleteRecipeOptions,
    type UpdateRecipeOptions,
    type FilterRecipesOptions,
    type FilterRecipesInfiniteOptions,
    type RecipeFilterParams,
    type SubmitFlagAppealOptions
} from './keys';
import type { RecipeForCreatePayload } from '@/common/types/recipe';

export const recipeQueryClient = {
    useRecipeByDisplayId: (
        displayId: string,
        options?: Partial<RecipeByDisplayIdOptions>
    ) => {
        const { recipeRepository } = useRepositories();

        return useAppQuery(
            RECIPE_QUERY_KEYS.byDisplayId(displayId),
            ({ signal }) =>
                recipeRepository.getByDisplayId({ displayId, signal }),
            {
                enabled: Boolean(displayId),
                retry: 1,
                ...options
            }
        );
    },

    useRecipeById: (
        id: string | number,
        options?: Partial<RecipeByIdOptions>
    ) => {
        const { recipeRepository } = useRepositories();

        return useAppQuery(
            RECIPE_QUERY_KEYS.byId(id),
            ({ signal }) =>
                recipeRepository.getById({ id: String(id), signal }),
            {
                enabled: Boolean(id),
                retry: 1,
                ...options
            }
        );
    },

    useRecipeList: (
        batch: number,
        perPage: number,
        options?: Partial<RecipeListOptions>
    ) => {
        const { recipeRepository } = useRepositories();

        return useAppQuery(
            RECIPE_QUERY_KEYS.list(batch, perPage),
            ({ signal }) => recipeRepository.list({ batch, perPage, signal }),
            {
                enabled: Boolean(batch > 0 && perPage),
                retry: 1,
                placeholderData: keepPreviousData,
                ...options
            }
        );
    },

    useRecipeListInfinite: (
        perPage: number,
        maxBatches?: number,
        options?: Partial<RecipeListInfiniteOptions>
    ) => {
        const { recipeRepository } = useRepositories();

        return useInfiniteQuery({
            queryKey: [...RECIPE_QUERY_KEYS.listInfinite(perPage)],
            initialPageParam: 1,
            queryFn: ({ pageParam, signal }) =>
                recipeRepository.list({
                    batch: Number(pageParam ?? 1),
                    perPage,
                    signal
                }),
            getNextPageParam: (lastPage, allPages) => {
                if (lastPage.length < perPage) return null;
                if (maxBatches !== undefined && allPages.length >= maxBatches)
                    return null;
                return allPages.length + 1;
            },
            enabled: Boolean(perPage),
            ...options
        });
    },

    useSearchRecipes: (
        query: string,
        batch: number,
        perPage: number,
        options?: Partial<SearchRecipesOptions>
    ) => {
        const { recipeRepository } = useRepositories();

        return useAppQuery(
            RECIPE_QUERY_KEYS.search(query, batch, perPage),
            ({ signal }) =>
                recipeRepository.search({
                    query,
                    batch,
                    perPage,
                    signal
                }),
            {
                enabled: Boolean(query && batch > 0 && perPage),
                retry: 1,
                placeholderData: keepPreviousData,
                ...options
            }
        );
    },

    useSearchRecipesInfinite: (
        query: string,
        perPage: number,
        maxBatches?: number,
        options?: Partial<SearchRecipesInfiniteOptions>
    ) => {
        const { recipeRepository } = useRepositories();

        return useInfiniteQuery({
            queryKey: [...RECIPE_QUERY_KEYS.searchInfinite(query, perPage)],
            initialPageParam: 1,
            queryFn: ({ pageParam, signal }) =>
                recipeRepository.search({
                    query,
                    batch: Number(pageParam ?? 1),
                    perPage,
                    signal
                }),
            getNextPageParam: (lastPage, allPages) => {
                if (lastPage.length < perPage) return null;
                if (maxBatches !== undefined && allPages.length >= maxBatches)
                    return null;
                return allPages.length + 1;
            },
            enabled: Boolean(query && perPage),
            ...options
        });
    },

    useUserSearchRecipes: (
        userId: string,
        query: string,
        batch: number,
        perPage: number,
        options?: Partial<UserSearchRecipesOptions>
    ) => {
        const { recipeRepository } = useRepositories();

        return useAppQuery(
            RECIPE_QUERY_KEYS.userSearchRecipes(userId, query, batch, perPage),
            ({ signal }) =>
                recipeRepository.searchByUser({
                    userId,
                    query,
                    batch,
                    perPage,
                    signal
                }),
            {
                enabled: Boolean(userId && query && batch > 0 && perPage),
                retry: 1,
                placeholderData: keepPreviousData,
                ...options
            }
        );
    },

    useUserSearchRecipesInfinite: (
        userId: string,
        query: string,
        perPage: number,
        maxBatches?: number,
        options?: Partial<UserSearchRecipesInfiniteOptions>
    ) => {
        const { recipeRepository } = useRepositories();

        return useInfiniteQuery({
            queryKey: [
                ...RECIPE_QUERY_KEYS.userSearchRecipesInfinite(
                    userId,
                    query,
                    perPage
                )
            ],
            initialPageParam: 1,
            queryFn: ({ pageParam, signal }) =>
                recipeRepository.searchByUser({
                    userId,
                    query,
                    batch: Number(pageParam ?? 1),
                    perPage,
                    signal
                }),
            getNextPageParam: (lastPage, allPages) => {
                if (lastPage.length < perPage) return null;
                if (maxBatches !== undefined && allPages.length >= maxBatches)
                    return null;
                return allPages.length + 1;
            },
            enabled: Boolean(userId && query && perPage),
            ...options
        });
    },

    useUserRecipes: (
        userId: string,
        batch: number,
        perPage: number,
        options?: Partial<UserRecipesOptions>
    ) => {
        const { recipeRepository } = useRepositories();

        return useAppQuery(
            RECIPE_QUERY_KEYS.userRecipes(userId, batch, perPage),
            ({ signal }) =>
                recipeRepository.listByUser({
                    userId,
                    batch,
                    perPage,
                    signal
                }),
            {
                enabled: Boolean(userId && batch > 0 && perPage),
                retry: 1,
                placeholderData: keepPreviousData,
                ...options
            }
        );
    },

    useUserRecipesInfinite: (
        userId: string,
        perPage: number,
        maxBatches?: number,
        options?: Partial<UserRecipesInfiniteOptions>
    ) => {
        const { recipeRepository } = useRepositories();

        return useInfiniteQuery({
            queryKey: [
                ...RECIPE_QUERY_KEYS.userRecipesInfinite(userId, perPage)
            ],
            initialPageParam: 1,
            queryFn: ({ pageParam, signal }) =>
                recipeRepository.listByUser({
                    userId,
                    batch: Number(pageParam ?? 1),
                    perPage,
                    signal
                }),
            getNextPageParam: (lastPage, allPages) => {
                if (lastPage.length < perPage) return null;
                if (maxBatches !== undefined && allPages.length >= maxBatches)
                    return null;
                return allPages.length + 1;
            },
            enabled: Boolean(userId && perPage),
            ...options
        });
    },

    useFilterRecipes: (
        batch: number,
        perPage: number,
        filters: RecipeFilterParams = {},
        options?: Partial<FilterRecipesOptions>
    ) => {
        const { recipeRepository } = useRepositories();

        return useAppQuery(
            RECIPE_QUERY_KEYS.filter(batch, perPage, filters),
            ({ signal }) =>
                recipeRepository.filter({
                    batch,
                    perPage,
                    filters,
                    signal
                }),
            {
                enabled: Boolean(batch > 0 && perPage > 0),
                retry: 1,
                placeholderData: keepPreviousData,
                ...options
            }
        );
    },

    useFilterRecipesInfinite: (
        perPage: number,
        filters: RecipeFilterParams = {},
        maxBatches?: number,
        options?: Partial<FilterRecipesInfiniteOptions>
    ) => {
        const { recipeRepository } = useRepositories();

        return useInfiniteQuery({
            queryKey: [...RECIPE_QUERY_KEYS.filterInfinite(perPage, filters)],
            initialPageParam: 1,
            queryFn: ({ pageParam, signal }) =>
                recipeRepository.filter({
                    batch: Number(pageParam ?? 1),
                    perPage,
                    filters,
                    signal
                }),
            getNextPageParam: (lastPage, allPages) => {
                if (lastPage.length < perPage) return null;
                if (maxBatches !== undefined && allPages.length >= maxBatches)
                    return null;
                return allPages.length + 1;
            },
            enabled: Boolean(perPage > 0),
            ...options
        });
    },

    useCreateRecipe: (options?: Partial<CreateRecipeOptions>) => {
        const { recipeRepository } = useRepositories();

        return useAppMutation(
            (input: RecipeForCreatePayload) =>
                recipeRepository.create({ input }),
            options
        );
    },

    useUpdateRecipe: (options?: Partial<UpdateRecipeOptions>) => {
        const { recipeRepository } = useRepositories();

        return useAppMutation(
            ({
                id,
                recipe
            }: {
                id: string;
                recipe: Partial<RecipeForCreatePayload>;
            }) => recipeRepository.update({ id, patch: recipe }),
            options
        );
    },

    useDeleteRecipe: (options?: Partial<DeleteRecipeOptions>) => {
        const { recipeRepository } = useRepositories();

        return useAppMutation(
            (id: number) => recipeRepository.delete({ id }),
            options
        );
    },

    useRateRecipe: (options?: Partial<RateRecipeOptions>) => {
        const { recipeRepository } = useRepositories();

        return useAppMutation(
            ({ id, rating }: { id: string; rating: number }) =>
                recipeRepository.rate({ id, rating }),
            options
        );
    },

    useRegisterRecipeVisit: (options?: Partial<RegisterRecipeVisitOptions>) => {
        const { recipeRepository } = useRepositories();

        return useAppMutation(
            ({ id }: { id: string }) => recipeRepository.registerVisit({ id }),
            options
        );
    },

    useSubmitAppeal: (options?: Partial<SubmitFlagAppealOptions>) => {
        const { recipeRepository } = useRepositories();

        return useAppMutation(recipeRepository.submitAppeal, options);
    }
};
