'use client';

import React, { use } from 'react';
import { DesktopRecipeViewTemplate } from './Desktop';
import { MobileRecipeViewTemplate } from './Mobile';
import type { RecipeDTO } from '@/common/types';
import { useIngredientSelectStore, useAuth } from '@/client/store';
import apiClient from '@/client/request';
import { useRunOnce } from '@/client/hooks';

export type RecipeViewProps = Readonly<{
    recipe: Promise<RecipeDTO>;
}>;

export const RecipeViewTemplate: React.FC<RecipeViewProps> = ({ recipe }) => {
    const recipeResolved = use(recipe);
    const { resetSelectedIngredients } = useIngredientSelectStore();
    const { user } = useAuth();

    useRunOnce(() => {
        resetSelectedIngredients();

        if (recipeResolved?.id) {
            // Neither await this, nor catch any errors, if the recipe was loaded,
            // this will work too, if it does not, it does not matter the visit is not
            // recorded anyway
            apiClient.recipe
                .registerRecipeVisit(
                    recipeResolved.id.toString(),
                    user?.id?.toString() ?? null
                )
                .catch(() => {});
        }
    });

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
