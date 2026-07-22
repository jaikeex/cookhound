export type RecipeForCreate = {
    displayId: string;
    title: string;
    description: string | null;
    notes: string | null;
    time: number | null;
    portionSize: number | null;
    imageUrl: string | null;
};
