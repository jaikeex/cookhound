'use client';

import React from 'react';
import { RecipeFormShell } from '@/client/components/templates/Recipe/FormShell';
import { useRecipeFormController } from '@/client/hooks';
import type { Recipe } from '@/common/types';

export type RecipeEditTemplateProps = Readonly<{
    recipe: Recipe;
}>;

export const RecipeEditTemplate: React.FC<RecipeEditTemplateProps> = ({
    recipe
}) => {
    const controller = useRecipeFormController({
        mode: 'edit',
        initialRecipe: recipe
    });

    return (
        <RecipeFormShell {...controller} defaultValues={recipe} mode="edit" />
    );
};
