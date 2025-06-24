'use client';

import { Loader, RecipeCard } from '@/client/components';
import { useInfinityScroll } from '@/client/hooks';
import type { RecipeForDisplayDTO } from '@/common/types';
import classNames from 'classnames';
import * as React from 'react';

type RecipeCardListProps = Readonly<{
    className?: string;
    loadMore: () => void;
    hasMore: boolean;
    isLoading?: boolean;
    recipes: RecipeForDisplayDTO[];
}>;

export const RecipeCardList: React.FC<RecipeCardListProps> = ({
    className,
    loadMore,
    hasMore,
    isLoading,
    recipes
}) => {
    const { sentinelRef } = useInfinityScroll({
        loadMore,
        hasMore,
        isLoading
    });

    return (
        <React.Fragment>
            <div
                className={classNames(
                    'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4',
                    className
                )}
            >
                {recipes.map((recipe, index) => (
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

            <div ref={sentinelRef} className="w-full h-1" />

            {isLoading && (
                <div className="flex justify-center py-4">
                    <Loader />
                </div>
            )}
        </React.Fragment>
    );
};
