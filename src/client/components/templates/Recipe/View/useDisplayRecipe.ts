'use client';

import { chqc, QUERY_KEYS } from '@/client/request/queryClient';
import {
    useAuth,
    useIngredientSelectStore,
    useLocale,
    useSnackbar
} from '@/client/store';
import { useShoppingList } from '@/client/hooks';
import { revalidateRouteCache } from '@/common/utils';
import type { RecipeDTO } from '@/common/types/recipe';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useDisplayRecipe = (recipe: RecipeDTO) => {
    const { t } = useLocale();
    const { user } = useAuth();
    const { alert } = useSnackbar();
    const router = useRouter();
    const queryClient = useQueryClient();

    const { createShoppingList } = useShoppingList();
    const { selectedIngredients } = useIngredientSelectStore();

    const { mutate: rateRecipe } = chqc.recipe.useRateRecipe({
        onSuccess: async () => {
            // Invalidate is not sufficient here.
            queryClient.refetchQueries({
                queryKey: QUERY_KEYS.recipe.byDisplayId(recipe.displayId)
            });

            alert({
                message: t('app.recipe.rated'),
                variant: 'success'
            });

            handleMutateRecipeSuccess();
        },
        onError: () => {
            alert({
                message: t('app.error.default'),
                variant: 'error'
            });
        }
    });

    const handleMutateRecipeSuccess = useCallback(async () => {
        await revalidateRouteCache(`/recipe/${recipe.displayId}`);
        router.refresh();
    }, [recipe.displayId, router]);

    const handleRateRecipe = useCallback(
        async (rating: number) => {
            rateRecipe({
                id: recipe.id.toString(),
                rating
            });
        },
        [recipe.id, rateRecipe]
    );

    const onShoppingListCreate = useCallback(async () => {
        const ingredientsToInclude = recipe.ingredients
            .filter(
                (ingredient) =>
                    !selectedIngredients.some((i) => i.id === ingredient.id)
            )
            .map((ingredient) => ({
                id: ingredient.id,
                quantity: ingredient.quantity,
                marked: false
            }));

        if (!user) return;

        try {
            await createShoppingList({
                recipeId: recipe.id,
                ingredients: ingredientsToInclude
            });

            alert({
                message: t('app.shopping-list.edited'),
                variant: 'success'
            });
        } catch (error: unknown) {
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
