import type { Cookbook } from '@prisma/client';

export enum CookbookVisibility {
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE',
    UNLISTED = 'UNLISTED'
}

export type CookbookForCreatePayload = {
    title: string;
    description: string | null;
    visibility: CookbookVisibility;
};

export type CookbookFromDb = Omit<Cookbook, 'ownerOrder'>;

export type CookbookVisibilityGroup = 'public' | 'self' | 'admin';
