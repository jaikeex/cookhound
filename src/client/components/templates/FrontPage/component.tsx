'use client';

import type { RecipeForDisplayDTO } from '@/common/types';
import React, { use, useState, useRef, useCallback, useEffect } from 'react';
import { RecipeCard } from '@/client/components/molecules';
import apiClient from '@/client/request';
import { Loader } from '@/client/components/atoms/Loader';

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
    /** The next batch value to request (starts at 2, because 1 is already rendered) */
    const [nextBatch, setNextBatch] = useState<number>(2);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);

    /** Sentinel element observed for triggering the next load */
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    //|-----------------------------------------------------------------------------------------|//
    //?                                       INFINITY STONE                                    ?//
    //|-----------------------------------------------------------------------------------------|//

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore || nextBatch > 5) return;

        setIsLoading(true);

        try {
            const newRecipes = await apiClient.recipe.getRecipeList(
                nextBatch,
                24
            );

            // If the API returned no items, this is the end of the list.
            if (!newRecipes?.length) {
                setHasMore(false);
                return;
            }

            setRecipeList((prev) => [...prev, ...newRecipes]);
            setNextBatch((prev) => prev + 1);

            // Stop after 5 batches regardless of API response length
            if (nextBatch >= 5) {
                setHasMore(false);
            }
        } catch (error) {
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMore, nextBatch]);

    useEffect(() => {
        const node = sentinelRef.current;
        if (!node || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting) {
                    loadMore();
                }
            },
            {
                root: null,
                rootMargin: '200px 0px', // start loading a bit before the user hits the end
                threshold: 0.1
            }
        );

        observer.observe(node);

        // Cleanup on unmount or dependency change
        return () => {
            observer.disconnect();
        };
    }, [loadMore, hasMore]);

    //|-----------------------------------------------------------------------------------------|//
    //?                                          RENDER                                         ?//
    //|-----------------------------------------------------------------------------------------|//

    return (
        <>
            <div className="grid max-w-screen-sm grid-cols-2 gap-4 px-2 mx-auto md:max-w-screen-md 3xl:max-w-screen-lg md:grid-cols-3">
                {recipeList.map((recipe, index) => (
                    <RecipeCard
                        key={`${recipe.id}-${index}`}
                        displayId={recipe.displayId}
                        title={recipe.title}
                        imageUrl={recipe.imageUrl}
                        rating={recipe.rating}
                        time={recipe.time ?? 0}
                        portionSize={recipe.portionSize ?? 0}
                        index={index}
                    />
                ))}
            </div>

            {/* Sentinel element */}
            <div ref={sentinelRef} className="w-full h-1" />

            {/* Loader displayed while fetching next batch */}
            {isLoading && (
                <div className="flex justify-center py-4">
                    <Loader />
                </div>
            )}
        </>
    );
};
