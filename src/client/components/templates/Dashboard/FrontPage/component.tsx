'use client';

import React, { use, useState, useCallback } from 'react';
import type { RecipeForDisplayDTO } from '@/common/types';
import { Banner, RecipeCardList } from '@/client/components';
import apiClient from '@/client/request';
import { useLocale } from '@/client/store/I18nContext';

type FrontPageProps = Readonly<{
    recipes: Promise<RecipeForDisplayDTO[]>;
}>;

export const FrontPageTemplate: React.FC<FrontPageProps> = ({ recipes }) => {
    //|-----------------------------------------------------------------------------------------|//
    //?                                          SETUP                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    const initialRecipes = use(recipes);

    const [recipeList, setRecipeList] =
        useState<RecipeForDisplayDTO[]>(initialRecipes);

    const [nextBatch, setNextBatch] = useState<number>(2);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const { locale } = useLocale();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isSearchMode, setIsSearchMode] = useState<boolean>(false);

    //|-----------------------------------------------------------------------------------------|//
    //?                                          FETCHING                                       ?//
    //|-----------------------------------------------------------------------------------------|//

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);

        try {
            let newRecipes: RecipeForDisplayDTO[] = [];

            if (isSearchMode) {
                newRecipes = await apiClient.recipe.searchRecipes(
                    searchQuery,
                    locale,
                    nextBatch,
                    24
                );
            } else {
                if (nextBatch > 5) return; // limit batches for default list
                newRecipes = await apiClient.recipe.getRecipeList(
                    nextBatch,
                    24
                );
            }

            if (!newRecipes?.length) {
                setHasMore(false);
                return;
            }

            setRecipeList((prev) => [...prev, ...newRecipes]);
            setNextBatch((prev) => prev + 1);
        } catch (error) {
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMore, nextBatch, isSearchMode, searchQuery, locale]);

    // Handle starting a new search
    const executeSearch = useCallback(async () => {
        const trimmed = searchQuery.trim();

        // If search cleared, revert to default list
        if (!trimmed) {
            setIsSearchMode(false);
            setNextBatch(2);
            setHasMore(true);
            return;
        }

        setIsLoading(true);
        setIsSearchMode(true);

        try {
            const results = await apiClient.recipe.searchRecipes(
                trimmed,
                locale,
                1,
                24
            );

            setRecipeList(results);
            setNextBatch(2);
            setHasMore(true);
        } catch (error) {
            setRecipeList(initialRecipes);
            setIsSearchMode(false);
            // keep previous list on error
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, locale, initialRecipes]);

    // Memoised handlers to avoid inline arrow functions in JSX
    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchQuery(e.target.value);
        },
        []
    );

    //|-----------------------------------------------------------------------------------------|//
    //?                                          RENDER                                         ?//
    //|-----------------------------------------------------------------------------------------|//

    return (
        <div className="flex flex-col max-w-screen-sm gap-4 px-2 mx-auto md:max-w-screen-md xl:max-w-screen-lg">
            <Banner
                onChange={handleInputChange}
                onSearch={executeSearch}
                isLoading={isLoading && isSearchMode}
            />

            <RecipeCardList
                className="mt-32 md:mt-36"
                recipes={recipeList}
                loadMore={loadMore}
                hasMore={hasMore}
                isLoading={isLoading}
            />
        </div>
    );
};
