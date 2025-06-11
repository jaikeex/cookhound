import React from 'react';
import apiClient from '@/client/services';
import { RecipeViewTemplate } from '@/client/components';

type RecipePageParams = {
    readonly params: Promise<{
        id: string;
    }>;
};

export default async function Page({ params }: RecipePageParams) {
    const paramsResolved = await params;
    const recipeId = paramsResolved.id;

    const recipe = await apiClient.recipe.getRecipeById(recipeId, {
        revalidate: 3600
    });

    return <RecipeViewTemplate recipe={recipe} />;
}
