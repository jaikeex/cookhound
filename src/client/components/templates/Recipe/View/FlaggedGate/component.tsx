'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/client/store';
import { Loader } from '@/client/components/atoms/Loader';
import type { Recipe } from '@/common/types';

const FlaggedAuthorTemplate = dynamic(() =>
    import('@/client/components/templates/Recipe/Flagged').then(
        (mod) => mod.FlaggedAuthorTemplate
    )
);

const FlaggedTemplate = dynamic(() =>
    import('@/client/components/templates/Error/Flagged').then(
        (mod) => mod.FlaggedTemplate
    )
);

export type RecipeFlaggedGateProps = Readonly<{
    recipe: Recipe;
}>;

export const RecipeFlaggedGate: React.FC<RecipeFlaggedGateProps> = ({
    recipe
}) => {
    const { authResolved, user } = useAuth();

    // The route is ISR'd, so the prerendered document always resolves this gate with
    // no user. Deciding before auth lands would serve the author of the recipe the
    // public takedown screen for the duration of the session request, then swap it
    // for their own appeal view, hold the decision until actually known.
    if (!authResolved) {
        return (
            <div className="flex justify-center pt-10">
                <Loader />
            </div>
        );
    }

    const isAuthor = !!user?.id && user.id === recipe.authorId;

    return isAuthor ? (
        <FlaggedAuthorTemplate recipe={recipe} />
    ) : (
        <FlaggedTemplate />
    );
};
