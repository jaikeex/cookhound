'use client';

import React, { use, useCallback, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
    Banner,
    RecipeCardList,
    Typography,
    ChipButton
} from '@/client/components';
import type { RecipeForDisplayDTO } from '@/common/types';
import { useRecipeDiscovery } from '@/client/hooks';
import { useRouter } from 'next/navigation';
import { classNames } from '@/client/utils';
import { SEARCH_QUERY_SEPARATOR } from '@/common/constants';
import { useLocale } from '@/client/store';

type SearchTemplateProps = Readonly<{
    initialRecipes: Promise<RecipeForDisplayDTO[]>;
    initialQuery?: string;
}>;

export const SearchTemplate: React.FC<SearchTemplateProps> = ({
    initialRecipes,
    initialQuery = ''
}) => {
    const resolvedRecipes = use(initialRecipes);

    const { t } = useLocale();
    const router = useRouter();
    const [searchInput, setSearchInput] = useState('');

    // Prepare initial queries array by splitting the URL param on "|". Needs to use some shit like this
    // besides spaces because that would fuck up the search completely.
    const initialQueries = initialQuery
        ? initialQuery
              .split(SEARCH_QUERY_SEPARATOR)
              .map((q) => q.trim())
              .filter(Boolean)
        : [];

    const {
        recipes,
        hasMore,
        isLoading,
        queries,
        addQuery,
        removeQuery,
        loadMore,
        reset
    } = useRecipeDiscovery(resolvedRecipes, initialQueries);

    const handleInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            setSearchInput(e.target.value);
        },
        []
    );

    const executeSearch = useCallback(() => {
        const trimmed = searchInput.trim();

        if (!trimmed) {
            // Reset the local state AND clean the URL.
            reset();
            setSearchInput('');
            router.replace('/search', { scroll: false });
            return;
        }

        const newQueries = Array.from(new Set([...queries, trimmed]));

        router.replace(
            `/search?query=${encodeURIComponent(newQueries.join(SEARCH_QUERY_SEPARATOR))}`,
            {
                scroll: false
            }
        );

        addQuery(trimmed);
        setSearchInput('');
    }, [searchInput, router, addQuery, reset, queries]);

    const handleClearQuery = useCallback(
        (term: string) => () => {
            removeQuery(term);

            const remaining = queries.filter((q) => q !== term);

            if (remaining.length === 0) {
                setSearchInput('');
                router.push('/');
                return;
            }

            router.replace(
                `/search?query=${encodeURIComponent(remaining.join(SEARCH_QUERY_SEPARATOR))}`,
                {
                    scroll: false
                }
            );
        },
        [removeQuery, queries, router]
    );

    return (
        <div className="page-wrapper flex flex-col gap-4 mt-36 md:mt-40">
            <Banner
                initialQueries={initialQueries}
                onChange={handleInputChange}
                onSearch={executeSearch}
                isLoading={isLoading}
            />
            {queries.length > 0 && (
                <div className="flex flex-wrap items-center w-full gap-2">
                    <Typography variant="body" className="text-center">
                        Vyhledávání:
                    </Typography>
                    {queries.map((term) => (
                        <ChipButton
                            key={term}
                            size="sm"
                            color="warning"
                            icon="close"
                            onClick={handleClearQuery(term)}
                        >
                            {term}
                        </ChipButton>
                    ))}
                </div>
            )}

            {recipes.length > 0 ? (
                <React.Fragment>
                    <RecipeCardList
                        recipes={recipes}
                        loadMore={loadMore}
                        hasMore={hasMore}
                        isLoading={isLoading}
                    />
                </React.Fragment>
            ) : (
                <div
                    className={classNames(
                        'flex flex-col items-center justify-center w-full h-64'
                    )}
                >
                    <Typography variant="heading-md" className="text-center">
                        {t('app.general.search-no-results')}
                    </Typography>
                </div>
            )}
        </div>
    );
};
