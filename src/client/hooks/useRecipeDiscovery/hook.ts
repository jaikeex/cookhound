import { useCallback, useMemo, useState, useEffect } from 'react';
import apiClient from '@/client/request';
import type { RecipeForDisplayDTO } from '@/common/types';
import { useLocale } from '@/client/store/I18nContext';
import { SEARCH_QUERY_SEPARATOR } from '@/common/constants';

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
//# This hook gives absolutely ZERO FUCKS about any other methods of storing the state
//# (especially the search queries) besides the native state inside this hook. If the
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
    initialQuery: string | string[] = ''
) => {
    const { locale } = useLocale();

    const [queries, setQueries] = useState<string[]>(
        normaliseToArray(initialQuery)
    );

    const [recipes, setRecipes] =
        useState<RecipeForDisplayDTO[]>(initialRecipes);
    const [nextBatch, setNextBatch] = useState(2);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // A single string sent to the API.
    const queryString = useMemo(
        () => queries.join(SEARCH_QUERY_SEPARATOR),
        [queries]
    );

    /**
     * Clears relevant local state and makes the hook ready for another round of browsing.
     * Clearing the recipes state looks like shit in the browser, as the components are currently
     * implemented, so it is disabled now.
     *
     *§ Never call this inside any effect, or face the consequences.
     */
    const reset = useCallback(() => {
        setQueries([]);
        setNextBatch(2); // 2 is the correct value here, believe it or not...
        setHasMore(false);
    }, []);

    /**
     * Fetches the next batch of recipes – either from the default list or from
     * the Typesense full-text search endpoint depending on whether the user is
     * currently searching.
     */
    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);

        try {
            let newRecipes: RecipeForDisplayDTO[] = [];

            const batch = nextBatch;
            const perPage = PER_PAGE;

            if (queryString) {
                newRecipes = await apiClient.recipe.searchRecipes(
                    queryString,
                    locale,
                    batch,
                    perPage
                );
            } else {
                //Hard-limit the number of batches fetched on the front page so that the api does not get hammered.
                if (batch > MAX_BATCHES) {
                    setHasMore(false);
                    return;
                }

                newRecipes = await apiClient.recipe.getRecipeList(
                    batch,
                    perPage
                );
            }

            if (!newRecipes?.length) {
                setHasMore(false);
                return;
            }

            setRecipes((prev) => [...prev, ...newRecipes]);
            setNextBatch((prev) => prev + 1);
        } catch (_) {
            // On error stop requesting more batches – there is no reason to believe that subsequent calls
            // will be anymore successful.
            // DO NOT throw anything here. The caller should decide whether to do something about it and what.
            setError(new Error('Failed to load more recipes'));
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMore, nextBatch, queryString, locale]);

    /**
     * Adds a new search term to the current list and refreshes the results.
     * Duplicate terms are ignored.
     */
    const addQuery = useCallback(
        async (searchTerm: string) => {
            const trimmed = searchTerm.trim();

            if (!trimmed) return;

            if (queries.includes(trimmed)) return;

            const previousQueries = queries;
            const newQueries = [...previousQueries, trimmed];

            setIsLoading(true);
            setQueries(newQueries);
            setNextBatch(2);
            setHasMore(true);

            try {
                const results = await apiClient.recipe.searchRecipes(
                    newQueries.join(SEARCH_QUERY_SEPARATOR),
                    locale,
                    1,
                    PER_PAGE
                );

                setRecipes(results);
            } catch (_) {
                // On error stop requesting more batches – there is no reason to believe that subsequent calls
                // will be anymore successful. Also revert the queries to the previous state. The result
                // should simply be that nothing changed.
                // DO NOT throw anything here. The caller should decide whether to do something about it and what.
                setError(new Error('Failed to load more recipes'));
                setHasMore(false);
                setQueries(previousQueries);
            } finally {
                setIsLoading(false);
            }
        },
        [queries, locale]
    );

    /**
     * Removes a given search term and refreshes the results. When the last
     * term is removed, the hook resets back to the default (front-page) mode.
     */
    const removeQuery = useCallback(
        async (termToRemove: string) => {
            // No-op if the term is not present.
            if (!queries.includes(termToRemove)) return;

            const previousQueries = queries;

            const newQueries = queries.filter((q) => q !== termToRemove);

            if (newQueries.length === 0) {
                reset();
                return;
            }

            setIsLoading(true);
            setQueries(newQueries);
            setNextBatch(2);
            setHasMore(true);

            try {
                const results = await apiClient.recipe.searchRecipes(
                    newQueries.join(SEARCH_QUERY_SEPARATOR),
                    locale,
                    1,
                    PER_PAGE
                );

                setRecipes(results);
            } catch (_) {
                // On error stop requesting more batches – there is no reason to believe that subsequent calls
                // will be anymore successful. Also revert the queries to the previous state. The result
                // should simply be that nothing changed.
                // DO NOT throw anything here. The caller should decide whether to do something about it and what.
                setError(new Error('Failed to load more recipes'));
                setHasMore(false);
                setQueries(previousQueries);
            } finally {
                setIsLoading(false);
            }
        },
        [queries, locale, reset]
    );

    /**
     * Performs a new search.
     */
    const search = useCallback(
        async (searchTerm: string) => {
            const trimmed = searchTerm.trim();

            // Clearing the search brings the hook back to the default mode.
            if (!trimmed) {
                reset();
                return;
            }

            setIsLoading(true);
            setQueries([trimmed]);
            setNextBatch(2);
            setHasMore(true);

            try {
                const results = await apiClient.recipe.searchRecipes(
                    trimmed,
                    locale,
                    1,
                    PER_PAGE
                );

                setRecipes(results);
            } catch (_) {
                // DO NOT throw anything here. The caller should decide whether to do something about it and what.
                setError(new Error('Failed to load more recipes'));
                setHasMore(false);
                setQueries([]);
            } finally {
                setIsLoading(false);
            }
        },
        [locale, reset]
    );

    // Always try to load a batch if the results come empty from the server.
    useEffect(() => {
        const shouldAutoLoad = !initialRecipes || initialRecipes.length === 0;

        if (shouldAutoLoad && !isLoading) {
            setNextBatch(1);

            if (queryString) {
                search(queryString);
            } else {
                loadMore();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
