import { useCallback, useMemo, useState } from 'react';
import type { RecipeForDisplayDTO } from '@/common/types';
import { useLocale } from '@/client/store/I18nContext';
import { SEARCH_QUERY_SEPARATOR } from '@/common/constants';
import { chqc } from '@/client/request/queryClient';
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
//# This hook gives absolutely ZERO FUCKS about any other methods of storing the
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
    const { locale } = useLocale();

    // Normalised list of search terms.
    const [queries, setQueries] = useState<string[]>(
        normaliseToArray(initialQuery)
    );

    // Merge all queries into a single string.
    const queryString = useMemo(
        () => queries.join(SEARCH_QUERY_SEPARATOR),
        [queries]
    );

    const isSearchMode = queries.length > 0;

    //~-----------------------------------------------------------------------------------------~//
    //$                                         QUERIES                                         $//
    //~-----------------------------------------------------------------------------------------~//

    const listInfiniteQuery = userId
        ? chqc.recipe.useUserRecipesInfinite(
              userId,
              locale,
              PER_PAGE,
              MAX_BATCHES,
              {
                  enabled: !isSearchMode && Boolean(userId)
              }
          )
        : chqc.recipe.useRecipeListInfinite(locale, PER_PAGE, MAX_BATCHES, {
              enabled: !isSearchMode
          });

    const searchInfiniteQuery = userId
        ? chqc.recipe.useUserSearchRecipesInfinite(
              userId,
              queryString,
              locale,
              PER_PAGE,
              MAX_BATCHES,
              {
                  enabled: isSearchMode && Boolean(userId)
              }
          )
        : chqc.recipe.useSearchRecipesInfinite(
              queryString,
              locale,
              PER_PAGE,
              MAX_BATCHES,
              {
                  enabled: isSearchMode
              }
          );

    /**
     * Select the active query depending on the mode above.
     *~ Only call activeQuery aftier from this point onwards.
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
                    | InfiniteData<RecipeForDisplayDTO[]>
                    | undefined
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
