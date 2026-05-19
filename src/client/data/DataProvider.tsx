'use client';

import React, { createContext, useContext } from 'react';
import type { AdminRepository } from '@/client/data/admin/port';
import type { AuthRepository } from '@/client/data/auth/port';
import type { ContactRepository } from '@/client/data/contact/port';
import type { CookbookRepository } from '@/client/data/cookbook/port';
import type { FileRepository } from '@/client/data/file/port';
import type { IngredientRepository } from '@/client/data/ingredient/port';
import type { RecipeRepository } from '@/client/data/recipe/port';
import type { TagRepository } from '@/client/data/tag/port';
import type { UserRepository } from '@/client/data/user/port';

/**
 * Aggregated set of domain repositories injected at the app root.
 */
export type Repositories = Readonly<{
    adminRepository: AdminRepository;
    authRepository: AuthRepository;
    contactRepository: ContactRepository;
    cookbookRepository: CookbookRepository;
    fileRepository: FileRepository;
    ingredientRepository: IngredientRepository;
    recipeRepository: RecipeRepository;
    tagRepository: TagRepository;
    userRepository: UserRepository;
}>;

const DataContext = createContext<Repositories | null>(null);

export type DataProviderProps = Readonly<{
    value: Repositories;
    children: React.ReactNode;
}>;

export const DataProvider: React.FC<DataProviderProps> = ({
    value,
    children
}) => <DataContext.Provider value={value}>{children}</DataContext.Provider>;

export const useRepositories = (): Repositories => {
    const ctx = useContext(DataContext);

    if (!ctx) {
        throw new Error('useRepositories must be used inside a DataProvider');
    }

    return ctx;
};
