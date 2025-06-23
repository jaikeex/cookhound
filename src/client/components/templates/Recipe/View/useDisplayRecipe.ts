'use client';

import apiClient from '@/client/request';
import { recipeApiClient } from '@/client/request/recipe/RecipeApiClient';
import { useLocale, useSnackbar } from '@/client/store';
import { revalidateRouteCache } from '@/client/utils';
import type { RecipeDTO } from '@/common/types/recipe';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export const useDisplayRecipe = (recipe: RecipeDTO) => {
    const { t } = useLocale();
    const { alert } = useSnackbar();
    const router = useRouter();

    const handleRateRecipe = useCallback(
        async (rating: number) => {
            try {
                await recipeApiClient.rateRecipe(recipe.id.toString(), rating);
                await revalidateRouteCache(`/recipe/${recipe.id}`);

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
        [recipe.id, alert, t, router]
    );

    const onShoppingListCreate = useCallback(async () => {
        try {
            await apiClient.user.upsertShoppingList({
                recipeId: recipe.id,
                ingredients: recipe.ingredients
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
    }, [recipe.id, recipe.ingredients, alert, t]);

    return {
        rateRecipe: handleRateRecipe,
        onShoppingListCreate
    };
};
