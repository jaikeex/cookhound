export type RecipeCardProps = Readonly<{
    id: number;
    displayId: string;
    title: string;
    imageUrl: string;
    time: number;
    rating: number | null;
    portionSize: number | null;
    index?: number;
}>;
