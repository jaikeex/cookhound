export type Recipe = {
    id: number;
    title: string;
    language: string;
    authorId: number;
    time: number | null;
    difficulty: string;
    portionSize: number | null;
    ingredients: Ingredient[];
    instructions: string[];
    notes: string | null;
    imageUrl: string;
    rating: number | null;
    createdAt: string;
    updatedAt: string;
};

export type Ingredient = {
    id: number;
    name: string;
    quantity: string;
};

export type RecipeForCreate = {
    language: string;
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
    quantity: string;
};
