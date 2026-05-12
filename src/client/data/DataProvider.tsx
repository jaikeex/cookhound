'use client';

import React, { createContext, useContext } from 'react';
import type { AuthRepository } from '@/client/data/auth/port';
import type { IngredientRepository } from '@/client/data/ingredient/port';
import type { RecipeRepository } from '@/client/data/recipe/port';
import type { UserRepository } from '@/client/data/user/port';

/**
 * Aggregated set of domain repositories injected at the app root.
 */
export type Repositories = Readonly<{
    authRepository: AuthRepository;
    ingredientRepository: IngredientRepository;
    recipeRepository: RecipeRepository;
    userRepository: UserRepository;
}>;

const DataContext = createContext<Repositories | null>(null);

export type DataProviderProps = Readonly<{
    value: Repositories;
    children: React.ReactNode;
}>;

/**
 * Provides the set of domain repositories to descendant query hooks.
 * Mount once at the app root, alongside (and outside) the `QueryClientProvider`.
 */
export const DataProvider: React.FC<DataProviderProps> = ({
    value,
    children
}) => <DataContext.Provider value={value}>{children}</DataContext.Provider>;

/**
 * Returns the injected {@link Repositories}. Throws if called outside a
 * `DataProvider`, since silently returning `null` would mask wiring bugs.
 */
export const useRepositories = (): Repositories => {
    const ctx = useContext(DataContext);

    if (!ctx) {
        throw new Error('useRepositories must be used inside a DataProvider');
    }

    return ctx;
};
