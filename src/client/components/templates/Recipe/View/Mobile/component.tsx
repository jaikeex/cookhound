'use client';

import React from 'react';
import type { RecipeDTO } from '@/common/types/recipe';
import {
    Divider,
    MobileRecipeBody,
    MobileRecipeHead
} from '@/client/components';
import { useDisplayRecipe } from '@/client/components/templates/Recipe/View/useDisplayRecipe';

export type MobileRecipeViewProps = Readonly<{
    className?: string;
    isPreview?: boolean;
    recipe: RecipeDTO;
}>;

export const MobileRecipeViewTemplate: React.FC<MobileRecipeViewProps> = ({
    className,
    isPreview = false,
    recipe
}) => {
    const { rateRecipe, onShoppingListCreate } = useDisplayRecipe(recipe);

    return (
        <div className={`max-w-screen-md mx-auto ${className}`}>
            <div className={'space-y-4'}>
                <MobileRecipeHead
                    recipe={recipe}
                    isPreview={isPreview}
                    onRateRecipe={rateRecipe}
                />
                <Divider />
                <MobileRecipeBody
                    recipe={recipe}
                    isPreview={isPreview}
                    onShoppingListCreate={onShoppingListCreate}
                />
            </div>
        </div>
    );
};
