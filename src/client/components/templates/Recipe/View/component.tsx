'use client';

import React from 'react';
import { DesktopRecipeViewTemplate } from './Desktop';
import { MobileRecipeViewTemplate } from './Mobile';
import type { Recipe } from '@/common/types';
import { useAuth, RecipeHandlingProvider } from '@/client/store';
import { useRunOnce } from '@/client/hooks';
import { chqc, QUERY_KEYS } from '@/client/data';
import { useQueryClient } from '@tanstack/react-query';
import { FlaggedTemplate } from '@/client/components/templates/Error/Flagged';
import { FlaggedAuthorTemplate } from '@/client/components/templates/Recipe/Flagged';

export type RecipeViewProps = Readonly<{
    recipe: Recipe;
}>;

export const RecipeViewTemplate: React.FC<RecipeViewProps> = ({ recipe }) => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const isFlagged = recipe.flags?.some((flag) => flag.active);

    const { mutate: registerRecipeVisit } = chqc.recipe.useRegisterRecipeVisit({
        onSuccess: () => {
            if (!user?.id) return;

            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.user.lastViewedRecipes(user.id)
            });
        }
    });

    useRunOnce(() => {
        if (recipe?.id) {
            // Neither await this, nor catch any errors, if the recipe was loaded,
            // this will work too, if it does not, it does not matter the visit is not
            // recorded anyway
            registerRecipeVisit({
                id: recipe.id.toString()
            });
        }
    }, [recipe?.id]);

    if (isFlagged) {
        const isAuthor = !!user?.id && user.id === recipe.authorId;

        return isAuthor ? (
            <FlaggedAuthorTemplate recipe={recipe} />
        ) : (
            <FlaggedTemplate />
        );
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
        <RecipeHandlingProvider recipe={recipe}>
            <MobileRecipeViewTemplate className={'md:hidden'} />
            <DesktopRecipeViewTemplate className={'hidden md:block'} />
        </RecipeHandlingProvider>
    );
};
