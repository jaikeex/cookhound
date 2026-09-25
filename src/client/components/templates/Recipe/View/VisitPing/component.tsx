'use client';

import type React from 'react';
import { useAuth } from '@/client/store';
import { useRunOnce } from '@/client/hooks';
import { chqc, QUERY_KEYS } from '@/client/data';
import { useQueryClient } from '@tanstack/react-query';

export type RecipeVisitPingProps = Readonly<{
    recipeId: number | string;
}>;

export const RecipeVisitPing: React.FC<RecipeVisitPingProps> = ({
    recipeId
}) => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const { mutate: registerRecipeVisit } = chqc.recipe.useRegisterRecipeVisit({
        meta: { silent: true },
        onSuccess: () => {
            if (!user?.id) return;

            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.user.lastViewedRecipes(user.id)
            });
        }
    });

    useRunOnce(() => {
        if (recipeId) {
            // Neither await this, nor catch any errors, if the recipe was loaded,
            // this will work too, if it does not, it does not matter the visit is not
            // recorded anyway
            registerRecipeVisit({
                id: recipeId.toString()
            });
        }
    }, [recipeId]);

    return null;
};
