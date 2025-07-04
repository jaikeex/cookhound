'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SearchSuggestionBox } from './SearchSuggestionBox';
import { useOutsideClick } from '@/client/hooks';
import { useDebounce } from '@/client/hooks/useDebounce';
import { useAuth, useLocale } from '@/client/store';
import { SEARCH_QUERY_SEPARATOR } from '@/common/constants';
import type { RecipeForDisplayDTO } from '@/common/types';
import type { SearchInputProps } from '@/client/components/molecules/Form/SearchInput/component';
import { Chip, Typography, SearchInput } from '@/client/components';
import { useLocalStorage } from '@/client/hooks/useLocalStorage';
import { LOCAL_STORAGE_LAST_VIEWED_RECIPES_KEY } from '@/common/constants';
import { chqc } from '@/client/request/queryClient';

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

    // Guard against stale requests (explained below)
    const blurTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const containerRef = useOutsideClick<HTMLDivElement>(() => {
        setIsInputFocused(false);
    });

    const { value: localLastViewedRecipes } = useLocalStorage<
        RecipeForDisplayDTO[]
    >(LOCAL_STORAGE_LAST_VIEWED_RECIPES_KEY, []);

    //~-----------------------------------------------------------------------------------------~//
    //$                                      QUERIES & DATA                                     $//
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

    const isSearchMode = !!inputValue && !!preparedQuery;

    const searchRecipesQuery = chqc.recipe.useSearchRecipes(
        preparedQuery,
        locale,
        1,
        5,
        { enabled: isInputFocused && enableSuggestions && isSearchMode }
    );

    const lastViewedRecipesQuery = chqc.user.useLastViewedRecipes(
        user?.id ?? 0,
        {
            enabled: !!user?.id && enableSuggestions && !preparedQuery
        }
    );

    const suggestions = useMemo(() => {
        if (isSearchMode && searchRecipesQuery.data !== undefined) {
            return searchRecipesQuery.data.slice(0, 5);
        } else {
            if (user?.id) {
                return lastViewedRecipesQuery.data?.slice(0, 5) ?? [];
            }

            if (localLastViewedRecipes !== undefined) {
                return localLastViewedRecipes.slice(0, 5);
            }

            return [];
        }
    }, [
        isSearchMode,
        lastViewedRecipesQuery.data,
        localLastViewedRecipes,
        searchRecipesQuery.data,
        user?.id
    ]);

    //~-----------------------------------------------------------------------------------------~//
    //$                                         UTILITY                                         $//
    //~-----------------------------------------------------------------------------------------~//

    // The use of isFetching is intentional here.
    const isLoading = isSearchMode ? searchRecipesQuery.isFetching : false;

    const error = isSearchMode
        ? ((searchRecipesQuery.error as Error | null)?.message ?? null)
        : ((lastViewedRecipesQuery.error as Error | null)?.message ?? null);

    const isEmpty = !isLoading && suggestions.length === 0;
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
            isLoading={isLoading}
            onSearch={handleSearch}
        >
            {shouldShowSuggestions && (
                <SearchSuggestionBox
                    suggestions={suggestions}
                    isEmpty={isEmpty}
                    isLoading={isLoading}
                    error={error}
                    onSuggestionClick={handleSuggestionClick}
                    title={titleElement}
                    emptyMessage={emptyMessage}
                />
            )}
        </SearchInput>
    );
};
