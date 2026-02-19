'use client';

import { useCallback, useMemo, useState } from 'react';
import type { RecipeForDisplayDTO } from '@/common/types';
import type { RecipeFilterParams } from '@/common/types/recipe';
import { useLocale } from '@/client/store/I18nContext';
import { useDebounce } from '@/client/hooks/useDebounce';
import { chqc } from '@/client/request/queryClient';
import type { InfiniteData } from '@tanstack/react-query';

//§—————————————————————————————————————————————————————————————————————————————————————————————§//
//§                                           WARNING                                           §//
///
//# This hook does not care about persisting filters anywhere outside of its
//# own internal state. If the intention is to also reflect the active filters in URL search
//# params, the caller MUST take care of that itself.
///
//§—————————————————————————————————————————————————————————————————————————————————————————————§//

const PER_PAGE = 24;
const MAX_BATCHES = 5;
const DEBOUNCE_MS = 400;

/**
 * Hook for browsing filtered recipes.
 *
 * @param initialFilters - Optional initial filter state. Defaults to no filters.
 */
export const useRecipeFilters = (initialFilters: RecipeFilterParams = {}) => {
    const { locale } = useLocale();

    const [filters, setFiltersState] =
        useState<RecipeFilterParams>(initialFilters);

    const debouncedFilters = useDebounce(filters, DEBOUNCE_MS);

    //~-----------------------------------------------------------------------------------------~//
    //$                                          QUERY                                          $//
    //~-----------------------------------------------------------------------------------------~//

    const filterQuery = chqc.recipe.useFilterRecipesInfinite(
        locale,
        PER_PAGE,
        debouncedFilters,
        MAX_BATCHES
    );

    //~-----------------------------------------------------------------------------------------~//
    //$                                           DATA                                          $//
    //~-----------------------------------------------------------------------------------------~//

    const recipes = useMemo<RecipeForDisplayDTO[]>(() => {
        const pages =
            (
                filterQuery.data as
                    | InfiniteData<RecipeForDisplayDTO[]>
                    | undefined
            )?.pages ?? [];

        return pages.flat();
    }, [filterQuery.data]);

    //~-----------------------------------------------------------------------------------------~//
    //$                                         HOOK API                                        $//
    //~-----------------------------------------------------------------------------------------~//

    const hasMore = Boolean(filterQuery.hasNextPage);
    const error = (filterQuery.error ?? null) as Error | null;

    const isLoading =
        filterQuery.isLoading ||
        filterQuery.isFetching ||
        filterQuery.isFetchingNextPage;

    const loadMore = useCallback(() => {
        if (!filterQuery.hasNextPage || filterQuery.isFetchingNextPage) return;

        // Simply swallow the error. This will look to the user like they have reached the end of the list.
        filterQuery.fetchNextPage().catch(() => undefined);
    }, [filterQuery]);

    const setFilters = useCallback((next: RecipeFilterParams) => {
        setFiltersState(next);
    }, []);

    /**
     * Update a single filter key without touching the others.
     *
     * @param key - The filter key to update.
     * @param value - The new value for the filter key. Passing undefined clears the key.
     */
    const updateFilter = useCallback(
        <K extends keyof RecipeFilterParams>(
            key: K,
            value: RecipeFilterParams[K]
        ) => {
            setFiltersState((prev) => {
                const next = { ...prev };

                if (value === undefined) {
                    delete next[key];
                } else {
                    next[key] = value;
                }

                return next;
            });
        },
        []
    );

    const clearFilters = useCallback(() => {
        setFiltersState({});
    }, []);

    return {
        recipes,
        filters,
        hasMore,
        isLoading,
        error,
        setFilters,
        updateFilter,
        clearFilters,
        loadMore
    } as const;
};
