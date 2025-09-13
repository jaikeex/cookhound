'use client';

import React from 'react';
import { RecipeFormShell } from '@/client/components';
import { useRecipeFormController } from '@/client/hooks';
import type { RecipeDTO } from '@/common/types';

export type RecipeEditTemplateProps = Readonly<{
    recipe: RecipeDTO;
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
