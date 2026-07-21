import type { Locale } from '@/common/types';
import type { RecipeFlagDTO } from './flags/recipe-flag';
import type { RecipeTagDTO } from './tags';

/**
 * Canonical in-memory recipe shape with real `Date` instances. Used by
 * server code (services, jobs, search index) and by client code after
 * `reviveRecipeDates` has converted the wire form. This is the type the
 * application reasons about end-to-end; `RecipeDTO` is only the transient
 * JSON form that crosses the network boundary.
 */
export type Recipe = {
    id: number;
    displayId: string;
    title: string;
    authorId: number;
    language: Locale;
    time: number | null;
    portionSize: number | null;
    ingredients: Ingredient[];
    instructions: string[];
    description: string | null;
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

/**
 * Shape as it arrives over the wire (JSON), with `createdAt` / `updatedAt`
 * as ISO strings rather than `Date` instances. Use only at the apiClient
 * seam: `RecipeApiClient` returns this, and `reviveRecipeDates` converts
 * it into `Recipe`. Keeping this type distinct ensures forgetting to
 * revive is a compile-time error rather than a runtime surprise.
 */
export type RecipeDTO = Omit<Recipe, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
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
    flags?: RecipeFlagDTO[] | null;
};

export type Ingredient = {
    id: number;
    name: string;
    quantity: string | null;
    category?: string | null;
    categoryOrder?: number | null;
};

export type RecipeForCreatePayload = {
    title: string;
    instructions: string[];
    description: string | null;
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
