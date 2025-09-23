import type { Locale } from '@/common/types';

export type RecipeForCreate = {
    displayId: string;
    language: Locale;
    title: string;
    notes: string | null;
    time: number | null;
    portionSize: number | null;
    imageUrl: string | null;
};
