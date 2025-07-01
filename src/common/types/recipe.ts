import type { Locale } from '@/client/locales';

export type RecipeDTO = {
    id: number;
    displayId: string;
    title: string;
    authorId: number;
    language: Locale;
    time: number | null;
    portionSize: number | null;
    ingredients: Ingredient[];
    instructions: string[];
    notes: string | null;
    imageUrl: string;
    rating: number | null;
    timesRated: number;
    timesViewed: number;
};

export type RecipeForDisplayDTO = {
    id: number;
    displayId: string;
    title: string;
    imageUrl: string;
    rating: number | null;
    timesRated: number;
    time: number | null;
    portionSize: number | null;
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
    portionSize: number | null;
    imageUrl: string | null;
    ingredients: IngredientForCreate[];
};

export type IngredientForCreate = {
    name: string;
    quantity: string | null;
};

export type RecipeVisitPayload = {
    id: string;
    userId: string | null;
};

export type RecipeRatingPayload = {
    id: string;
    rating: number;
};
