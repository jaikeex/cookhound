import type { RecipeForDisplayDTO } from '@/common/types';
import React from 'react';
import { RecipeCardList } from '@/client/components';
import { useRecipeDiscovery } from '@/client/hooks/useRecipeDiscovery/hook';
import { useMemo } from 'react';

export type RecipesProps = Readonly<{
    isCurrentUser: boolean;
    recipes: RecipeForDisplayDTO[];
    userId: number;
}>;

export const Recipes: React.FC<RecipesProps> = ({
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
            recipes={displayRecipes}
            loadMore={loadMore}
            hasMore={hasMore}
            isLoading={isLoading}
            withHandling={isCurrentUser}
        />
    );
};
