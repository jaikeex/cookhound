import type { RecipeDTO } from './recipe';

export type ShoppingListIngredientDTO = {
    recipeId: number;
    name: string;
    id: number;
    quantity: string | null;
    marked: boolean;
};

export type ShoppingListDTO = {
    recipe: Pick<RecipeDTO, 'displayId' | 'title' | 'portionSize'>;
    ingredients: ShoppingListIngredientDTO[];
};

export type ShoppingListIngredientPayload = {
    id: number;
    marked?: boolean;
    quantity: string | null;
};

export type ShoppingListPayload = {
    recipeId: number;
    ingredients: ShoppingListIngredientPayload[];
};
