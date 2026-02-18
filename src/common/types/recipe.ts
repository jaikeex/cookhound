import type { Locale } from '@/common/types';
import type { RecipeFlagDTO } from './flags/recipe-flag';
import type { RecipeTagDTO } from './tags';

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
    flags: RecipeFlagDTO[] | null;
    timesRated: number;
    timesViewed: number;
    tags: RecipeTagDTO[] | null;
    createdAt: Date;
    updatedAt: Date;
};

// Used on the client with real date objects
export type Recipe = Omit<RecipeDTO, 'createdAt' | 'updatedAt'> & {
    createdAt: Date;
    updatedAt: Date;
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
    category?: string | null;
    categoryOrder?: number | null;
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
    tags: { id: number }[] | null;
};

export type IngredientForCreate = {
    name: string;
    quantity: string | null;
    category?: string | null;
};

export type IngredientForUpdate = {
    id?: number;
    name: string;
    quantity: string | null;
    category?: string | null;
};

export type RecipeVisitPayload = {
    id: string;
    userId: string | null;
};

export type RecipeRatingPayload = {
    id: string;
    rating: number;
};

export type RecipeFilterParams = {
    containsIngredients?: number[];
    excludesIngredients?: number[];
    timeMin?: number;
    timeMax?: number;
    tags?: number[];
    hasImage?: boolean;
};
