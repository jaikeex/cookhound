import type { Cookbook as PrismaCookbook } from '@/server/db/generated/prisma/client';
import type { RecipeForDisplayDTO } from './recipe';

export enum CookbookVisibility {
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE',
    UNLISTED = 'UNLISTED'
}

export type Cookbook = {
    id: number;
    displayId: string;
    ownerId: number;
    title: string;
    description: string | null;
    visibility: CookbookVisibility;
    coverImageUrl: string | null;
    recipeCount: number;
    recipes: RecipeForDisplayDTO[];
    createdAt?: Date;
    updatedAt?: Date;
};

export type CookbookForCreatePayload = {
    title: string;
    description: string | null;
    visibility: CookbookVisibility;
};

export type CookbookFromDb = Omit<PrismaCookbook, 'ownerOrder'>;

export type CookbookVisibilityGroup = 'public' | 'self' | 'admin';
