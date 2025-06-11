'use client';

import React, { useEffect } from 'react';
import { DesktopRecipeViewTemplate } from './Desktop';
import { MobileRecipeViewTemplate } from './Mobile';
import type { Recipe } from '@/common/types';
import { useIngredientSelectStore } from '@/client/store';

export type RecipeViewProps = Readonly<{
    recipe: Recipe;
}>;

export const RecipeViewTemplate: React.FC<RecipeViewProps> = ({ recipe }) => {
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
            <MobileRecipeViewTemplate recipe={recipe} className={'md:hidden'} />
            <DesktopRecipeViewTemplate
                recipe={recipe}
                className={'hidden md:block'}
            />
        </React.Fragment>
    );
};
