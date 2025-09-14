import React from 'react';
import { apiClient } from '@/client/request';
import { RecipeViewTemplate } from '@/client/components';

type RecipePageParams = {
    readonly params: Promise<
        Readonly<{
            displayId: string;
        }>
    >;
};

export default async function Page({ params }: RecipePageParams) {
    const paramsResolved = await params;
    const recipeDisplayId = paramsResolved.displayId;

    const recipe = apiClient.recipe.getRecipeByDisplayId(recipeDisplayId, {
        revalidate: 3600
    });

    return <RecipeViewTemplate recipe={recipe} />;
}
