import type { Locale } from '@/common/types';
import type { CookbookVisibility } from '@/common/types';

export type CookbookForCreate = {
    displayId: string;
    ownerId: number;
    title: string;
    description: string | null;
    language: Locale;
    visibility: CookbookVisibility;
};
