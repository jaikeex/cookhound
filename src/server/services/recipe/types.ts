import type { Locale } from '@/client/locales';

export type RecipeForCreate = {
    language: Locale;
    title: string;
    notes: string | null;
    time: number | null;
    difficulty: string;
    portionSize: number | null;
    imageUrl: string | null;
};
