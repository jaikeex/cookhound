export type Recipe = {
    id: number;
    title: string;
    language: string;
    author_id: number;
    time: number | null;
    difficulty: string;
    portion_size: number | null;
    ingredients: Ingredient[];
    instructions: string[];
    notes: string | null;
    image_url: string;
    rating: number | null;
    created_at: string;
    updated_at: string;
};

export type Ingredient = {
    id: number;
    name: string;
    quantity: string;
};
