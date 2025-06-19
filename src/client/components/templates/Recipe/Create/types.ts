import type { Ingredient } from '@/common/types';

export type RecipeForCreateFormData = {
    title: string;
    difficulty: string;
    portionSize: number | null;
    time: number | null;
    imageUrl: string | null;
    notes: string | null;
    ingredients: Omit<Ingredient, 'id'>[];
    instructions: string[];
};
