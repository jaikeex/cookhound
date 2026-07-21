// @vitest-environment jsdom

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DataProvider, type Repositories } from '@/client/data';
import type { AdminRepository } from '@/client/data/admin/port';
import type { CookbookRepository } from '@/client/data/cookbook/port';
import type { IngredientRepository } from '@/client/data/ingredient/port';
import type { RecipeRepository } from '@/client/data/recipe/port';
import type { UserRepository } from '@/client/data/user/port';
import type { AuthRepository } from '@/client/data/auth/port';
import type { FileRepository } from '@/client/data/file/port';
import type { TagRepository } from '@/client/data/tag/port';
import type { ContactRepository } from '@/client/data/contact/port';
import { buildEmptyRepository } from '@/client/data/__testing__/buildEmptyRepository';
import type { IngredientDTO } from '@/common/types';
import { ingredientQueryClient } from '@/client/data/ingredient';

const fixtureIngredients: IngredientDTO[] = [
    { id: 1, name: 'Salt' },
    { id: 2, name: 'Pepper' }
];

const buildFakeIngredientRepository = (
    overrides: Partial<IngredientRepository> = {}
): IngredientRepository => ({
    list: vi.fn().mockResolvedValue(fixtureIngredients),
    ...overrides
});

const buildWrapper = (repositories: Repositories) => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
    });
    return ({ children }: Readonly<{ children: React.ReactNode }>) => (
        <QueryClientProvider client={queryClient}>
            <DataProvider value={repositories}>{children}</DataProvider>
        </QueryClientProvider>
    );
};

describe('useIngredients', () => {
    it('returns the ingredients from the injected repository', async () => {
        const repo = buildFakeIngredientRepository();
        const wrapper = buildWrapper({
            ingredientRepository: repo,
            recipeRepository: buildEmptyRepository<RecipeRepository>(),
            userRepository: buildEmptyRepository<UserRepository>(),
            authRepository: buildEmptyRepository<AuthRepository>(),
            fileRepository: buildEmptyRepository<FileRepository>(),
            tagRepository: buildEmptyRepository<TagRepository>(),
            contactRepository: buildEmptyRepository<ContactRepository>(),
            adminRepository: buildEmptyRepository<AdminRepository>(),
            cookbookRepository: buildEmptyRepository<CookbookRepository>()
        });

        const { result } = renderHook(
            () => ingredientQueryClient.useIngredients(),
            { wrapper }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(repo.list).toHaveBeenCalledTimes(1);
        expect(repo.list).toHaveBeenCalledWith(
            expect.objectContaining({
                signal: expect.any(AbortSignal)
            })
        );
        expect(result.current.data).toEqual(fixtureIngredients);
    });
});
