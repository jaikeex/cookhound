import type { RecipeForDisplayDTO } from '@/common/types';
import React from 'react';
import { RecipeCardList } from '@/client/components';
import { useRecipeDiscovery } from '@/client/hooks/useRecipeDiscovery/hook';
import { useMemo } from 'react';
import type { RecipeCardListGridColumns } from '@/client/components';

export type RecipesProps = Readonly<{
    className?: string;
    cols?: RecipeCardListGridColumns;
    isCurrentUser: boolean;
    recipes: RecipeForDisplayDTO[];
    userId: number;
}>;

export const Recipes: React.FC<RecipesProps> = ({
    className,
    cols,
    recipes: initialRecipes,
    userId,
    isCurrentUser
}) => {
    const { recipes, loadMore, hasMore, isLoading } = useRecipeDiscovery(
        initialRecipes,
        '',
        userId.toString()
    );

    const displayRecipes = useMemo(() => recipes, [recipes]);

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
