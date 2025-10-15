'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SearchSuggestionBox } from './SearchSuggestionBox';
import { useOutsideClick } from '@/client/hooks';
import { useDebounce } from '@/client/hooks/useDebounce';
import { useAuth, useLocale } from '@/client/store';
import { SEARCH_QUERY_SEPARATOR } from '@/common/constants';
import type { SearchInputProps } from '@/client/components/molecules/Form/SearchInput/component';
import { Chip, Typography, SearchInput } from '@/client/components';
import { chqc } from '@/client/request/queryClient';
import Link from 'next/link';

export type RecipeSearchInputProps = Readonly<{
    enableSuggestions?: boolean;
    initialQueries?: string[];
}> &
    SearchInputProps;

export const RecipeSearchInput: React.FC<RecipeSearchInputProps> = ({
    defaultValue,
    enableSuggestions = true,
    initialQueries,
    onChange,
    onSearch,
    value,
    ...rest
}) => {
    //~-----------------------------------------------------------------------------------------~//
    //$                                          STATE                                          $//
    //~-----------------------------------------------------------------------------------------~//

    const { locale, t } = useLocale();
    const { user, authResolved } = useAuth();

    const [inputValue, setInputValue] = useState(value ?? defaultValue ?? '');
    const [isInputFocused, setIsInputFocused] = useState(false);

    const containerRef = useOutsideClick<HTMLDivElement>(() => {
        setIsInputFocused(false);
    });

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

            return [];
        }
    }, [
        isSearchMode,
        lastViewedRecipesQuery.data,
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

    const handleSearch = useCallback(() => {
        onSearch?.();
        setIsInputFocused(false);
    }, [onSearch]);

    const handleInputBlur = useCallback(() => {
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

        if (!user && authResolved) {
            return (
                <React.Fragment>
                    <Link href="/auth/login">
                        {t('app.recipe.search-suggestions.login-link')}
                    </Link>
                    &nbsp;
                    {t('app.recipe.search-suggestions.empty-anonymous')}
                </React.Fragment>
            );
        }

        return t('app.recipe.search-suggestions.empty-last-viewed');
    }, [isShowingSearchResults, t, user, authResolved]);

    //~-----------------------------------------------------------------------------------------~//
    //$                                         RENDER                                          $//
    //~-----------------------------------------------------------------------------------------~//

    return (
        <SearchInput
            {...rest}
            defaultValue={defaultValue}
            isLoading={isLoading}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onSearch={handleSearch}
            placeholder={t('app.recipe.search.placeholder')}
            ref={containerRef}
            value={value}
        >
            {shouldShowSuggestions && (
                <SearchSuggestionBox
                    emptyMessage={emptyMessage}
                    error={error}
                    onClose={handleInputBlur}
                    isEmpty={isEmpty}
                    isLoading={isLoading}
                    suggestions={suggestions}
                    title={titleElement}
                />
            )}
        </SearchInput>
    );
};
