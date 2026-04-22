import type { Locale } from '@/common/types';

export type RecipeForEvaluation = {
    title: string;
    language: Locale;
    time: number | null;
    portionSize: number | null;
    ingredients: IngredientForEvaluation[];
    instructions: string[];
    description: string | null;
    notes: string | null;
};

type IngredientForEvaluation = {
    name: string;
    quantity: string | null;
};
