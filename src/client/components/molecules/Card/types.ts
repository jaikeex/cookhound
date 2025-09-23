export type RecipeCardProps = Readonly<{
    displayId: string;
    id: number;
    imageUrl: string;
    index?: number;
    portionSize: number | null;
    rating: number | null;
    time: number;
    title: string;
}>;
