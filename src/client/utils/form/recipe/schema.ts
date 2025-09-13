import { z } from 'zod';

export const recipeFormSchema = z.object({
    title: z.string().trim().min(1, 'app.recipe.error.title-required'),
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

export type RecipeFormSchema = typeof recipeFormSchema;
