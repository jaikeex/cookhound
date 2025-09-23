'use client';

import React from 'react';
import { RecipeFormShell } from '@/client/components';
import { useRecipeFormController } from '@/client/hooks';
import { z } from 'zod';

//~---------------------------------------------------------------------------------------------~//
//$                                           SCHEMA                                            $//
//~---------------------------------------------------------------------------------------------~//

export const createRecipeSchema = z.object({
    title: z.string().trim().trim().min(1, 'app.recipe.error.title-required'),
    portionSize: z.number().nullable(),
    time: z.number().nullable(),
    imageUrl: z.string().trim().nullable(),
    notes: z.string().trim().nullable(),
    ingredients: z
        .array(
            z.object({
                name: z.string().trim().min(1).max(100),
                quantity: z.string().trim().max(256)
            })
        )
        .min(1, 'app.recipe.error.ingredients-required'),
    instructions: z
        .array(z.string().trim().min(1))
        .min(1, 'app.recipe.error.instructions-required')
});

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

export const RecipeCreateTemplate: React.FC = () => {
    const controller = useRecipeFormController({ mode: 'create' });

    return (
        <RecipeFormShell {...controller} defaultValues={null} mode="create" />
    );
};
