import React from 'react';
import { recipeService } from '@/client/services';
import { RecipeViewTemplate } from '@/client/components';

type RecipePageParams = {
    readonly params: Promise<{
        id: string;
    }>;
};

export default async function Page({ params }: RecipePageParams) {
    const paramsResolved = await params;
    const recipeId = paramsResolved.id;

    const recipe = await recipeService.getRecipeById(recipeId, {
        revalidate: 3600
    });

    return <RecipeViewTemplate recipe={recipe} />;
}
