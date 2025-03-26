export type RecipeForCreate = {
    language: string;
    title: string;
    instructions: string[];
    notes: string | null;
    time: number | null;
    difficulty: string;
    portion_size: number | null;
    image_url: string | null;
    ingredients: IngredientForCreate[];
};

export type IngredientForCreate = {
    name: string;
    quantity: string;
};
