'use client';

import { recipeApiClient } from '@/client/request/recipe/RecipeApiClient';
import {
    useAuth,
    useIngredientSelectStore,
    useLocale,
    useShoppingListStore,
    useSnackbar
} from '@/client/store';
import { revalidateRouteCache } from '@/client/utils';
import type { RecipeDTO } from '@/common/types/recipe';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export const useDisplayRecipe = (recipe: RecipeDTO) => {
    const { t } = useLocale();
    const { user } = useAuth();
    const { alert } = useSnackbar();
    const router = useRouter();

    const { createShoppingList } = useShoppingListStore();
    const { selectedIngredients } = useIngredientSelectStore();

    const handleRateRecipe = useCallback(
        async (rating: number) => {
            try {
                await recipeApiClient.rateRecipe(recipe.id.toString(), rating);
                await revalidateRouteCache(`/recipe/${recipe.displayId}`);

                alert({
                    message: t('app.recipe.rated'),
                    variant: 'success'
                });

                // Refresh the server component to get updated data
                router.refresh();
            } catch (error) {
                alert({
                    message: t('app.error.default'),
                    variant: 'error'
                });
            }
        },
        [recipe.id, recipe.displayId, alert, t, router]
    );

    const onShoppingListCreate = useCallback(async () => {
        const ingredientsToInclude = recipe.ingredients.filter(
            (ingredient) =>
                !selectedIngredients.some((i) => i.id === ingredient.id)
        );

        if (!user) return;

        try {
            await createShoppingList(user.id, {
                recipeId: recipe.id,
                ingredients: ingredientsToInclude
            });

            alert({
                message: t('app.shopping-list.edited'),
                variant: 'success'
            });
        } catch (error) {
            alert({
                message: t('app.error.default'),
                variant: 'error'
            });
        }
    }, [
        recipe.ingredients,
        recipe.id,
        selectedIngredients,
        createShoppingList,
        alert,
        t,
        user
    ]);

    return {
        rateRecipe: handleRateRecipe,
        onShoppingListCreate
    };
};
