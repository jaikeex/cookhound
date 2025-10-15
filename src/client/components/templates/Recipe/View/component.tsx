'use client';

import React, { use } from 'react';
import { DesktopRecipeViewTemplate } from './Desktop';
import { MobileRecipeViewTemplate } from './Mobile';
import type { RecipeDTO } from '@/common/types';
import { useIngredientSelectStore, useAuth } from '@/client/store';
import { useRunOnce } from '@/client/hooks';
import { chqc, QUERY_KEYS } from '@/client/request/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { FlaggedTemplate } from '@/client/components/templates/Error/Flagged';

export type RecipeViewProps = Readonly<{
    recipe: Promise<RecipeDTO>;
}>;

export const RecipeViewTemplate: React.FC<RecipeViewProps> = ({ recipe }) => {
    const recipeResolved = use(recipe);
    const queryClient = useQueryClient();
    const { resetSelectedIngredients } = useIngredientSelectStore();
    const { user } = useAuth();

    const isFlagged = recipeResolved.flags?.some((flag) => flag.active);

    const { mutate: registerRecipeVisit } = chqc.recipe.useRegisterRecipeVisit({
        onSuccess: () => {
            if (!user?.id) return;

            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.user.lastViewedRecipes(user.id)
            });
        }
    });

    useRunOnce(() => {
        resetSelectedIngredients();

        if (recipeResolved?.id) {
            // Neither await this, nor catch any errors, if the recipe was loaded,
            // this will work too, if it does not, it does not matter the visit is not
            // recorded anyway
            registerRecipeVisit({
                id: recipeResolved.id.toString(),
                userId: user?.id?.toString() ?? null
            });
        }
    }, [recipeResolved?.id]);

    if (isFlagged) {
        return <FlaggedTemplate />;
    }

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
