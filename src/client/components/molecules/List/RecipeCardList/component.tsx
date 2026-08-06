'use client';

import { Loader } from '@/client/components/atoms/Loader';
import {
    RecipeCardGrid,
    type RecipeCardListGridColumns
} from '@/client/components/molecules/List/RecipeCardGrid';
import { useInfinityScroll } from '@/client/hooks';
import type { RecipeForDisplayDTO } from '@/common/types';
import * as React from 'react';

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
    cols,
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

    return (
        <React.Fragment>
            <RecipeCardGrid
                className={className}
                cols={cols}
                recipes={recipes}
                withHandling={withHandling}
            />

            <div ref={sentinelRef} className="w-full h-1" />

            {isLoading && (
                <div className="flex justify-center py-4">
                    <Loader />
                </div>
            )}
        </React.Fragment>
    );
};
