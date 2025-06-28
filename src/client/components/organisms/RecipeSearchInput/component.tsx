'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SearchSuggestionBox } from './SearchSuggestionBox';
import { useOutsideClick } from '@/client/hooks';
import { useDebounce } from '@/client/hooks/useDebounce';
import { useAuth, useLocale } from '@/client/store';
import apiClient from '@/client/request';
import { SEARCH_QUERY_SEPARATOR } from '@/common/constants';
import type { RecipeForDisplayDTO } from '@/common/types';
import type { SearchInputProps } from '@/client/components/molecules/Form/SearchInput/component';
import { Chip, Typography, SearchInput } from '@/client/components';
import { useLocalStorage } from '@/client/hooks/useLocalStorage';
import { LOCAL_STORAGE_LAST_VIEWED_RECIPES_KEY } from '@/common/constants';

export type RecipeSearchInputProps = Readonly<{
    enableSuggestions?: boolean;
    initialQueries?: string[];
}> &
    SearchInputProps;

export const RecipeSearchInput: React.FC<RecipeSearchInputProps> = ({
    enableSuggestions = true,
    onChange,
    value,
    defaultValue,
    initialQueries,
    onSearch,
    ...rest
}) => {
    //~-----------------------------------------------------------------------------------------~//
    //$                                          STATE                                          $//
    //~-----------------------------------------------------------------------------------------~//

    const { locale, t } = useLocale();
    const { user } = useAuth();

    const [inputValue, setInputValue] = useState(value ?? defaultValue ?? '');
    const [isInputFocused, setIsInputFocused] = useState(false);

    const [suggestions, setSuggestions] = useState<RecipeForDisplayDTO[]>([]);
    const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
    const [suggestionsError, setSuggestionsError] = useState<string | null>(
        null
    );

    // Guard against stale requests (explained below)
    const latestRequestIdRef = React.useRef(0);
    const blurTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const containerRef = useOutsideClick<HTMLDivElement>(() => {
        setIsInputFocused(false);
    });

    const { value: localLastViewedRecipes } = useLocalStorage<
        RecipeForDisplayDTO[]
    >(LOCAL_STORAGE_LAST_VIEWED_RECIPES_KEY, []);

    //~-----------------------------------------------------------------------------------------~//
    //$                                     FETCH FUNCTIONS                                     $//
    //~-----------------------------------------------------------------------------------------~//

    const debouncedInputValue = useDebounce(inputValue, 300);

    const preparedQuery = useMemo(
        () =>
            [
                debouncedInputValue.trim(),
                ...(initialQueries ? initialQueries : [])
            ]
                .filter(Boolean)
                .join(SEARCH_QUERY_SEPARATOR),
        [debouncedInputValue, initialQueries]
    );

    const fetchSearchResults = useCallback(
        async (query: string): Promise<RecipeForDisplayDTO[]> => {
            if (!query) return [];

            try {
                return await apiClient.recipe.searchRecipes(
                    query,
                    locale,
                    1,
                    5
                );
            } catch {
                return [];
            }
        },
        [locale]
    );

    const fetchLastViewedRecipes = useCallback(async (): Promise<
        RecipeForDisplayDTO[]
    > => {
        if (user?.id) {
            try {
                const results = await apiClient.user.getUserLastViewedRecipes(
                    user.id
                );
                return results.slice(0, 5);
            } catch {
                return [];
            }
        }

        /**
         * Fallback to the ls data for anonymous users.
         */
        return localLastViewedRecipes;
    }, [user, localLastViewedRecipes]);

    //~-----------------------------------------------------------------------------------------~//
    //$                                   SUGGESTIONS EFFECT                                    $//
    //~-----------------------------------------------------------------------------------------~//

    // Main effect: decide which dataset to display based on focus & input value
    useEffect(() => {
        const active = isInputFocused && enableSuggestions;

        if (!active) {
            setSuggestions([]);
            setIsSuggestionsLoading(false);
            setSuggestionsError(null);
            return;
        }

        //?—————————————————————————————————————————————————————————————————————————————————————?//
        //?                                       GUARDS                                        ?//
        ///
        //# So this is interesting (suggested to me by o3 after trying to fix completely
        //# different problem, but i liked the idea).
        //#
        //# Two things are happening here:
        //#  (1) - The 'cancelled' flag effectively terminates any state update from older effects
        //#        that did not have the time to resolve before another one is called
        //#      - Immediately before each state update there is a guard 'if (!cancelled)'
        //#      - As soon as React runs the cleanup, cancelled becomes true. Any request resolved
        //#        later will see cancelled === true (because it closed over it and the cleanup
        //#        runs in the same closure) and simply skip the state update.
        //#
        //#  (2) - The latestRequestIdRef check is making sure that the only the newest request
        //#        wins even if multiple effects are still mounted
        ///
        //?—————————————————————————————————————————————————————————————————————————————————————?//

        let cancelled = false;
        const currentRequestId = ++latestRequestIdRef.current;

        const fetchSuggestions = async (): Promise<void> => {
            setIsSuggestionsLoading(true);
            setSuggestionsError(null);

            try {
                const results =
                    inputValue.trim() && preparedQuery
                        ? await fetchSearchResults(preparedQuery)
                        : await fetchLastViewedRecipes();

                // Only update if this is the latest in-flight request and still mounted
                if (
                    !cancelled &&
                    currentRequestId === latestRequestIdRef.current
                ) {
                    setSuggestions(results);
                }
            } catch (err) {
                if (!cancelled) {
                    setSuggestionsError(
                        err instanceof Error ? err.message : 'Unknown error'
                    );
                    setSuggestions([]);
                }
            } finally {
                if (
                    !cancelled &&
                    currentRequestId === latestRequestIdRef.current
                ) {
                    setIsSuggestionsLoading(false);
                }
            }
        };

        fetchSuggestions();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        isInputFocused,
        enableSuggestions,
        preparedQuery,
        locale,
        user?.id,
        localLastViewedRecipes
    ]);

    //~-----------------------------------------------------------------------------------------~//
    //$                                         UTILITY                                         $//
    //~-----------------------------------------------------------------------------------------~//

    const isEmpty = !isSuggestionsLoading && suggestions.length === 0;
    const isShowingSearchResults = !!inputValue && preparedQuery.length > 0;
    const shouldShowSuggestions = enableSuggestions && isInputFocused;

    const handleInputChange = useCallback<
        NonNullable<SearchInputProps['onChange']>
    >(
        (e) => {
            setInputValue(e.target.value);
            onChange?.(e);
        },
        [onChange]
    );

    const handleInputFocus = useCallback(() => {
        setIsInputFocused(true);
    }, []);

    const handleInputBlur = useCallback(() => {
        // Delay to allow clicking on suggestions
        blurTimeoutRef.current = setTimeout(() => {
            setIsInputFocused(false);
        }, 200);
    }, []);

    const handleSearch = useCallback(() => {
        onSearch?.();
        setIsInputFocused(false);
    }, [onSearch]);

    // Clear pending timeout on unmount to avoid memory leaks
    // This is probably completely useless, but i just learned about how effect
    // callback work in-depth, and wanted to use it immediately.
    useEffect(() => {
        return () => {
            if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
            }
        };
    }, []);

    const handleSuggestionClick = useCallback(() => {
        setIsInputFocused(false);
    }, []);

    useEffect(() => {
        if (value !== undefined) {
            setInputValue(value);
        }
    }, [value]);

    //~-----------------------------------------------------------------------------------------~//
    //$                                           UI                                            $//
    //~-----------------------------------------------------------------------------------------~//

    const titleElement = useMemo(() => {
        if (!shouldShowSuggestions) return null;

        if (isShowingSearchResults) {
            return (
                <div className="flex items-center gap-1">
                    <Typography
                        variant="body-sm"
                        className="font-semibold text-start"
                    >
                        {t('app.recipe.search-suggestions.title')}
                    </Typography>
                    &nbsp;
                    {initialQueries?.map((query) => (
                        <Chip size="xs" key={query}>
                            {query}
                        </Chip>
                    ))}
                    <Chip size="xs" color="secondary">
                        {inputValue}
                    </Chip>
                </div>
            );
        }

        return (
            <Typography variant="body-sm" className="font-semibold text-start">
                {t('app.recipe.search-suggestions.title-last-viewed')}
            </Typography>
        );
    }, [
        shouldShowSuggestions,
        isShowingSearchResults,
        t,
        initialQueries,
        inputValue
    ]);

    const emptyMessage = useMemo(() => {
        if (isShowingSearchResults) {
            return t('app.recipe.search-suggestions.empty');
        }
        return t('app.recipe.search-suggestions.empty-last-viewed');
    }, [isShowingSearchResults, t]);

    //~-----------------------------------------------------------------------------------------~//
    //$                                         RENDER                                          $//
    //~-----------------------------------------------------------------------------------------~//

    return (
        <SearchInput
            {...rest}
            placeholder={t('app.recipe.search.placeholder')}
            ref={containerRef}
            value={value}
            defaultValue={defaultValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            isLoading={isSuggestionsLoading}
            onSearch={handleSearch}
        >
            {shouldShowSuggestions && (
                <SearchSuggestionBox
                    suggestions={suggestions}
                    isEmpty={isEmpty}
                    error={suggestionsError}
                    onSuggestionClick={handleSuggestionClick}
                    title={titleElement}
                    emptyMessage={emptyMessage}
                />
            )}
        </SearchInput>
    );
};
