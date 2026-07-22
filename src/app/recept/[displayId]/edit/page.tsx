import React from 'react';
import { serverData } from '@/server/data';
import { mapServiceErrorForRsc } from '@/server/data/runtime/mapError';
import { RecipeEditTemplate } from '@/client/components';
import { verifySessionFromCookie } from '@/server/utils/session/verify-server';
import { ClientRedirect } from '@/client/components';
import { ROUTES } from '@/common/constants';
import type { Metadata } from 'next';

type RecipePageParams = {
    readonly params: Promise<
        Readonly<{
            displayId: string;
        }>
    >;
};

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                      CLIENT REDIRECTS                                       ?//
///
//# This page uses client redirects instead of the next/navigation redirect functions.
//# The reason is that serverside redirects, when called from here, are causing reract to throw
//# "rendered more hooks than previous render" error. I was not able to identify exactly why,
//# the closest I got had to do with the page already being rendered while the redirect happened,
//# but I was not able to find any working fix. This was the recommended soluton i found online.
//# Not ideal, I really want to get to the bottom of this later.
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

export default async function Page({ params }: RecipePageParams) {
    const paramsResolved = await params;
    const recipeDisplayId = paramsResolved.displayId;

    const result = await verifySessionFromCookie();

    if (!result.isLoggedIn) {
        return (
            <ClientRedirect
                url={`${ROUTES.error.restricted}?anonymous=true&target=${ROUTES.recipe.edit(recipeDisplayId)}`}
            />
        );
    }

    // Always use fresh read, the author edits and saves over this, so it must
    // reflect the current recipe.
    const recipe = await serverData.recipe
        .getByDisplayIdFresh(recipeDisplayId)
        .catch((error) =>
            mapServiceErrorForRsc(error, ROUTES.recipe.edit(recipeDisplayId))
        );

    if (recipe.authorId !== result.session.userId) {
        return <ClientRedirect url="/" />;
    }

    return <RecipeEditTemplate recipe={recipe} />;
}

//|=============================================================================================|//

export const metadata: Metadata = {
    title: 'Edit Recipe | Cookhound',
    description: 'Edit your recipe on Cookhound.',
    robots: {
        index: false,
        follow: false
    }
};
