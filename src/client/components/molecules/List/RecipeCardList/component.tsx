'use client';

import { Loader, RecipeCard } from '@/client/components';
import { useInfinityScroll } from '@/client/hooks';
import type { RecipeForDisplayDTO } from '@/common/types';
import { classNames } from '@/client/utils';
import * as React from 'react';
import { RecipeWithHandling } from '@/client/components/molecules';

export type RecipeCardListGridColumns = {
    sm: number;
    md: number;
    lg: number;
    xl: number;
};

type RecipeCardListProps = Readonly<{
    className?: string;
    cols?: RecipeCardListGridColumns;
    loadMore: () => void;
    hasMore: boolean;
    isLoading?: boolean;
    recipes: RecipeForDisplayDTO[];
    withHandling?: boolean;
}>;

export const RecipeCardList: React.FC<RecipeCardListProps> = ({
    className,
    cols = { sm: 2, md: 3, lg: 4, xl: 4 },
    loadMore,
    hasMore,
    isLoading,
    recipes,
    withHandling = false
}) => {
    const { sentinelRef } = useInfinityScroll({
        loadMore,
        hasMore,
        isLoading
    });

    const RecipeCardComponent = withHandling ? RecipeWithHandling : RecipeCard;

    return (
        <React.Fragment>
            <div
                className={classNames(
                    `grid grid-cols-${cols.sm} gap-4 md:grid-cols-${cols.md} xl:grid-cols-${cols.lg}`,
                    className
                )}
            >
                {recipes.map((recipe, index) => (
                    <RecipeCardComponent
                        key={`${recipe.id}-${index}`}
                        id={recipe.id}
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
