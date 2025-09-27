'use client';

import { Loader, RecipeCard } from '@/client/components';
import { useInfinityScroll } from '@/client/hooks';
import type { RecipeForDisplayDTO } from '@/common/types';
import * as React from 'react';
import { RecipeWithHandling } from '@/client/components/molecules';
import { GRID_COLS } from '@/client/constants';

export type RecipeCardListGridColumns = {
    sm: (typeof GRID_COLS)[keyof typeof GRID_COLS];
    md: (typeof GRID_COLS)[keyof typeof GRID_COLS];
    lg: (typeof GRID_COLS)[keyof typeof GRID_COLS];
    xl: (typeof GRID_COLS)[keyof typeof GRID_COLS];
};

type RecipeCardListProps = Readonly<{
    className?: string;
    cols?: RecipeCardListGridColumns;
    hasMore: boolean;
    isLoading?: boolean;
    loadMore?: () => void;
    recipes: RecipeForDisplayDTO[];
    withHandling?: boolean;
}>;

export const RecipeCardList: React.FC<RecipeCardListProps> = ({
    className,
    cols = {
        sm: GRID_COLS[2],
        md: GRID_COLS[3],
        lg: GRID_COLS[4],
        xl: GRID_COLS[4]
    },
    hasMore,
    isLoading,
    loadMore = () => {},
    recipes,
    withHandling = false
}) => {
    const { sentinelRef } = useInfinityScroll({
        loadMore,
        hasMore,
        isLoading
    });

    const RecipeCardComponent = withHandling ? RecipeWithHandling : RecipeCard;

    // If you ask why this is necessary... it's hydration... it's always hydration...
    const baseClasses = `grid ${cols.sm} gap-4 md:${cols.md} lg:${cols.lg} xl:${cols.xl}`;
    const finalClassName = className
        ? `${baseClasses} ${className}`
        : baseClasses;

    return (
        <React.Fragment>
            {/* these classes are added dynamically, they need to exist at build time for tailwind compiler to register them */}
            <span className="hidden lg:grid-cols-3 xl:grid-cols-3" />
            <div className={finalClassName}>
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
