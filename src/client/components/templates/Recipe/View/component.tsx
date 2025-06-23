'use client';

import React, { use, useEffect } from 'react';
import { DesktopRecipeViewTemplate } from './Desktop';
import { MobileRecipeViewTemplate } from './Mobile';
import type { RecipeDTO } from '@/common/types';
import { useIngredientSelectStore } from '@/client/store';

export type RecipeViewProps = Readonly<{
    recipe: Promise<RecipeDTO>;
}>;

export const RecipeViewTemplate: React.FC<RecipeViewProps> = ({ recipe }) => {
    const recipeResolved = use(recipe);
    const { resetSelectedIngredients } = useIngredientSelectStore();

    /**
     * Reset selected ingredients when recipe changes
     */
    useEffect(() => {
        resetSelectedIngredients();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <React.Fragment>
            <MobileRecipeViewTemplate
                recipe={recipeResolved}
                className={'md:hidden'}
            />
            <DesktopRecipeViewTemplate
                recipe={recipeResolved}
                className={'hidden md:block'}
            />
        </React.Fragment>
    );
};
