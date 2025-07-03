import type { Locale } from '@/client/locales';

export type RecipeForEvaluation = {
    title: string;
    language: Locale;
    time: number | null;
    portionSize: number | null;
    ingredients: IngredientForEvaluation[];
    instructions: string[];
    notes: string | null;
};

type IngredientForEvaluation = {
    name: string;
    quantity: string | null;
};
