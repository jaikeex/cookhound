export type RecipeForEvaluation = {
    title: string;
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
