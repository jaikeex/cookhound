'use client';

import React, { use } from 'react';
import { DesktopRecipeViewTemplate } from './Desktop';
import { MobileRecipeViewTemplate } from './Mobile';
import type { RecipeDTO } from '@/common/types';
import { useAuth, RecipeHandlingProvider } from '@/client/store';
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

    //?—————————————————————————————————————————————————————————————————————————————————————————?//
    //?                       PASSING RECIPE AS PROP VS. CONTEXT VALUE                          ?//
    ///
    //# I am not entirely sure which one is bettter. On one hand, using the resolved rec. directly
    //# and passing it to templates and down below seems less obscure and easier to follow.
    //# On the other hand, feeding it into the context allows for a simpler source of truth
    //# and updating logic. On yet another hand, resorting to only the context would require
    //# calling it from pretty much every component down the tree that needs access to some
    //# of the recipe's values... so props are still used when appropriate.
    //#
    //# If someone is reading this and can offer an insight into this problem as to which approach
    //# is better in this use case, i would be eternally grateful (to a degree...)
    ///
    //?—————————————————————————————————————————————————————————————————————————————————————————?//

    return (
        <RecipeHandlingProvider recipe={recipeResolved}>
            <MobileRecipeViewTemplate className={'md:hidden'} />
            <DesktopRecipeViewTemplate className={'hidden md:block'} />
        </RecipeHandlingProvider>
    );
};
