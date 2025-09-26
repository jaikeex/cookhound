import React from 'react';
import { RecipeCardList } from '@/client/components';
import { SkeletonCard } from '@/client/components';
import { GRID_COLS } from '@/client/constants';
import { classNames } from '@/client/utils';
import { useRecipeDiscovery } from '@/client/hooks/useRecipeDiscovery/hook';
import { useMemo } from 'react';
import type { RecipeCardListGridColumns } from '@/client/components';

export type RecipesProps = Readonly<{
    className?: string;
    cols?: RecipeCardListGridColumns;
    isCurrentUser: boolean;
    userId: number;
}>;

export const Recipes: React.FC<RecipesProps> = ({
    className,
    cols,
    userId,
    isCurrentUser
}) => {
    const { recipes, loadMore, hasMore, isLoading } = useRecipeDiscovery(
        [],
        '',
        userId.toString()
    );

    const displayRecipes = useMemo(() => recipes, [recipes]);

    const isInitialLoading = isLoading && displayRecipes.length === 0;

    if (isInitialLoading) {
        const gridCols = cols ?? {
            sm: GRID_COLS[2],
            md: GRID_COLS[3],
            lg: GRID_COLS[4],
            xl: GRID_COLS[4]
        };

        const baseClasses = `grid ${gridCols.sm} gap-4 md:${gridCols.md} lg:${gridCols.lg} xl:${gridCols.xl}`;
        const finalClassName = className
            ? classNames(baseClasses, className)
            : baseClasses;

        const skeletonCards = Array.from({ length: 12 }, (_, index) => (
            <SkeletonCard key={index} />
        ));

        return <div className={finalClassName}>{skeletonCards}</div>;
    }

    return (
        <RecipeCardList
            className={className}
            cols={cols}
            recipes={displayRecipes}
            loadMore={loadMore}
            hasMore={hasMore}
            isLoading={isLoading}
            withHandling={isCurrentUser}
        />
    );
};
