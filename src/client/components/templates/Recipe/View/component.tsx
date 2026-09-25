import React from 'react';
import { RecipeFlaggedGate } from './FlaggedGate';
import { RecipeVisitPing } from './VisitPing';
import { RecipeViewLayout } from './Layout';
import { RecipeWakeLockOverlay } from '@/client/components/organisms/Recipe/View/WakeLockOverlay';
import type { Recipe, User } from '@/common/types';
import { RecipeHandlingProvider } from '@/client/store/RecipeHandlingContext';
import { FlaggedAuthorTemplate } from '@/client/components/templates/Recipe/Flagged';

export type RecipeViewProps = Readonly<{
    author?: User;
    recipe: Recipe;
}>;

export const RecipeViewTemplate: React.FC<RecipeViewProps> = ({
    author,
    recipe
}) => {
    const isFlagged = recipe.flags?.some((flag) => flag.active);

    if (isFlagged) {
        return (
            <RecipeFlaggedGate authorId={recipe.authorId}>
                <FlaggedAuthorTemplate recipe={recipe} />
            </RecipeFlaggedGate>
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
        <React.Fragment>
            <RecipeVisitPing recipeId={recipe.id} />

            <RecipeHandlingProvider recipe={recipe} author={author}>
                <RecipeViewLayout />
            </RecipeHandlingProvider>

            <RecipeWakeLockOverlay key={recipe.id} />
        </React.Fragment>
    );
};
