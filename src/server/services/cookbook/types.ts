import type { CookbookVisibility } from '@/common/types';

export type CookbookForCreate = {
    displayId: string;
    ownerId: number;
    title: string;
    description: string | null;
    visibility: CookbookVisibility;
};
