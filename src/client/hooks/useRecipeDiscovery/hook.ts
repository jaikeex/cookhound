'use client';

import { useCallback, useMemo, useState } from 'react';
import type { RecipeForDisplayDTO } from '@/common/types';
import { DEFAULT_LOCALE, SEARCH_QUERY_SEPARATOR } from '@/common/constants';
import { chqc } from '@/client/data';
import type { InfiniteData } from '@tanstack/react-query';

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                       IMPORTANT INFO                                        ?//
///
//# For bulk searching performed from this hook, DO NOT call typesense directly. The recipes
//# displayed through bulk searching should be cached, predictable and consistent, all of
//# those things are much easier to ensure on the server.
///
//§—————————————————————————————————————————————————————————————————————————————————————————————§//
//§                                           WARNING                                           §//
///
//# This hook does not care about any other methods of storing the
//# search queries besides the native state inside this hook. If the
//# intention is to also save the query strings inisde url search params, the caller
//# MUST take care of that itself.
///
//§—————————————————————————————————————————————————————————————————————————————————————————————§//

const PER_PAGE = 24;
const MAX_BATCHES = 5;

/**
 * This hook was written as a unified measure to load a list of recipes anywhere.
 *
 * If no initial query is provided, the first results will default to the general list.
 * Afther that, search mode can be activating at any time by simply adding a new query,
 * and deactivated by removing them all.
 */
export const useRecipeDiscovery = (
    initialRecipes: RecipeForDisplayDTO[],
    initialQuery: string | string[] = '',
    // When provided, all list/search operations will be scoped to the given user.
    userId?: string
) => {
    const [queries, setQueries] = useState<string[]>(
        normaliseToArray(initialQuery)
    );

    const queryString = useMemo(
        () => queries.join(SEARCH_QUERY_SEPARATOR),
        [queries]
    );

    const isSearchMode = queries.length > 0;

    //~-----------------------------------------------------------------------------------------~//
    //$                                     SSR CACHE SEED                                      $//
    //
    // The server already fetched page 1 (list or search results) and streamed it in as
    // initialRecipes. Seed it into react-query as the first page of the active infinite query
    // so the client does NOT refetch page 1 over HTTP on mount. initialDataUpdatedAt stamps the
    // seed as freshly fetched, so it stays within the global staleTime and refetchOnMount is a
    // no-op for the seeded page.
    //
    // Only the query that is active on the INITIAL mount is seeded (mode can change later as the
    // user types), and only when the server actually provided data.
    //~-----------------------------------------------------------------------------------------~//

    const [seededAt] = useState(() => Date.now());
    const [initialIsSearch] = useState(
        () => normaliseToArray(initialQuery).length > 0
    );

    const seed = useMemo<
        InfiniteData<RecipeForDisplayDTO[], number> | undefined
    >(
        () =>
            initialRecipes.length > 0
                ? { pages: [initialRecipes], pageParams: [1] }
                : undefined,
        [initialRecipes]
    );

    const listSeed = !initialIsSearch ? seed : undefined;
    const searchSeed = initialIsSearch ? seed : undefined;

    //~-----------------------------------------------------------------------------------------~//
    //$                                         QUERIES                                         $//
    //~-----------------------------------------------------------------------------------------~//

    const listInfiniteQuery = userId
        ? chqc.recipe.useUserRecipesInfinite(
              userId,
              DEFAULT_LOCALE,
              PER_PAGE,
              MAX_BATCHES,
              {
                  enabled: !isSearchMode && Boolean(userId),
                  initialData: listSeed,
                  initialDataUpdatedAt: listSeed ? seededAt : undefined
              }
          )
        : chqc.recipe.useRecipeListInfinite(
              DEFAULT_LOCALE,
              PER_PAGE,
              MAX_BATCHES,
              {
                  enabled: !isSearchMode,
                  initialData: listSeed,
                  initialDataUpdatedAt: listSeed ? seededAt : undefined
              }
          );

    const searchInfiniteQuery = userId
        ? chqc.recipe.useUserSearchRecipesInfinite(
              userId,
              queryString,
              DEFAULT_LOCALE,
              PER_PAGE,
              MAX_BATCHES,
              {
                  enabled: isSearchMode && Boolean(userId),
                  initialData: searchSeed,
                  initialDataUpdatedAt: searchSeed ? seededAt : undefined
              }
          )
        : chqc.recipe.useSearchRecipesInfinite(
              queryString,
              DEFAULT_LOCALE,
              PER_PAGE,
              MAX_BATCHES,
              {
                  enabled: isSearchMode,
                  initialData: searchSeed,
                  initialDataUpdatedAt: searchSeed ? seededAt : undefined
              }
          );

    /**
     * Select the active query depending on the mode above.
     *~ Only call activeQuery from this point onwards.
     */
    const activeQuery = isSearchMode ? searchInfiniteQuery : listInfiniteQuery;

    //~-----------------------------------------------------------------------------------------~//
    //$                                          DATA                                           $//
    //
    // Just a reminder to myself that useState is actually not needed everywhere it looks like it.
    // Sure, appending to an active state variable with previous results already present sounds
    // easier, but this sorts of calculated state really makes me appreciate the beauty of coding.
    //
    //~-----------------------------------------------------------------------------------------~//

    const recipes = useMemo<RecipeForDisplayDTO[]>(() => {
        const pages =
            (
                activeQuery.data as
                    InfiniteData<RecipeForDisplayDTO[]> | undefined
            )?.pages ?? [];

        if (pages.length === 0) return initialRecipes;

        return pages.flat();
    }, [activeQuery.data, initialRecipes]);

    //~-----------------------------------------------------------------------------------------~//
    //$                                         HOOK API                                        $//
    //~-----------------------------------------------------------------------------------------~//

    const hasMore = Boolean(activeQuery.hasNextPage);
    const error = (activeQuery.error ?? null) as Error | null;
    const isLoading =
        activeQuery.isLoading ||
        activeQuery.isFetching ||
        activeQuery.isFetchingNextPage;

    const loadMore = useCallback(() => {
        if (!activeQuery.hasNextPage || activeQuery.isFetchingNextPage) return;

        // Simply swallow the error. This will look to the user like they have reached the end of the list.
        activeQuery.fetchNextPage().catch(() => undefined);
    }, [activeQuery]);

    const addQuery = useCallback((term: string) => {
        const trimmed = term.trim();
        if (!trimmed) return;

        setQueries((prev) =>
            prev.includes(trimmed) ? prev : [...prev, trimmed]
        );
    }, []);

    const removeQuery = useCallback((termToRemove: string) => {
        setQueries((prev) => {
            if (!prev.includes(termToRemove)) return prev;
            return prev.filter((q) => q !== termToRemove);
        });
    }, []);

    const search = useCallback((term: string) => {
        const trimmed = term.trim();

        setQueries(trimmed ? [trimmed] : []);
    }, []);

    const reset = useCallback(() => {
        setQueries([]);
    }, []);

    return {
        recipes,
        hasMore,
        isLoading,
        queries,
        addQuery,
        removeQuery,
        loadMore,
        search,
        reset,
        error
    } as const;
};

function normaliseToArray(q: string | string[]): string[] {
    if (Array.isArray(q)) return q.map((v) => v.trim()).filter(Boolean);
    return q
        .split(/\s+/)
        .map((v) => v.trim())
        .filter(Boolean);
}
