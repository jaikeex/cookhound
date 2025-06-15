import type { Locale } from '@/client/locales';

export type RecipeDTO = {
    id: number;
    title: string;
    authorId: number;
    language: Locale;
    time: number | null;
    difficulty: string;
    portionSize: number | null;
    ingredients: Ingredient[];
    instructions: string[];
    notes: string | null;
    imageUrl: string;
    rating: number | null;
};

export type Ingredient = {
    id: number;
    name: string;
    quantity: string | null;
};

export type RecipeForCreatePayload = {
    language: Locale;
    title: string;
    instructions: string[];
    notes: string | null;
    time: number | null;
    difficulty: string;
    portionSize: number | null;
    imageUrl: string | null;
    ingredients: IngredientForCreate[];
};

export type IngredientForCreate = {
    name: string;
    quantity: string | null;
};
