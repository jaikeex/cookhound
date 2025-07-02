'use client';

import React, { use } from 'react';
import { DesktopRecipeViewTemplate } from './Desktop';
import { MobileRecipeViewTemplate } from './Mobile';
import type { RecipeDTO } from '@/common/types';
import type { RecipeForDisplayDTO } from '@/common/types';
import { useIngredientSelectStore, useAuth } from '@/client/store';
import { useRunOnce } from '@/client/hooks';
import { useLocalStorage } from '@/client/hooks/useLocalStorage';
import { LOCAL_STORAGE_LAST_VIEWED_RECIPES_KEY } from '@/common/constants';
import { chqc, QUERY_KEYS } from '@/client/request/queryClient';
import { useQueryClient } from '@tanstack/react-query';

export type RecipeViewProps = Readonly<{
    recipe: Promise<RecipeDTO>;
}>;

export const RecipeViewTemplate: React.FC<RecipeViewProps> = ({ recipe }) => {
    const recipeResolved = use(recipe);
    const queryClient = useQueryClient();
    const { resetSelectedIngredients } = useIngredientSelectStore();
    const { user } = useAuth();

    // Fuck vscode coloring fails
    const { setValue: setLastViewedRecipes } = useLocalStorage<
        RecipeForDisplayDTO[]
    >(LOCAL_STORAGE_LAST_VIEWED_RECIPES_KEY, []);

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

            // For anonymous users, also store the recipe locally so it can be suggested later.
            if (!user?.id) {
                const lightweight: RecipeForDisplayDTO = {
                    id: recipeResolved.id,
                    displayId: recipeResolved.displayId,
                    title: recipeResolved.title,
                    imageUrl: recipeResolved.imageUrl,
                    rating: recipeResolved.rating,
                    timesRated: recipeResolved.timesRated,
                    time: recipeResolved.time,
                    portionSize: recipeResolved.portionSize
                };

                // Ensure uniqueness (newest first) and limit to 5 entries.
                setLastViewedRecipes((prev) => {
                    const filtered = prev.filter(
                        (r) => r.id !== lightweight.id
                    );

                    return [lightweight, ...filtered].slice(0, 5);
                });
            }
        }
    }, [recipeResolved?.id]);

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
