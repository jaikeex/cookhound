// @vitest-environment jsdom

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DataProvider, type Repositories } from '@/client/data';
import type { RecipeRepository } from '@/client/data/recipe/port';
import type { UserRepository } from '@/client/data/user/port';
import type { AuthRepository } from '@/client/data/auth/port';
import type { FileRepository } from '@/client/data/file/port';
import type { IngredientRepository } from '@/client/data/ingredient/port';
import { buildEmptyRepository } from '@/client/data/__testing__/buildEmptyRepository';
import type { Recipe } from '@/common/types';
import { recipeQueryClient } from '@/client/data/recipe';

const fixtureRecipe: Recipe = {
    id: 42,
    displayId: 'rcp_42',
    title: 'Test recipe',
    authorId: 7,
    language: 'en',
    time: 30,
    portionSize: 4,
    ingredients: [],
    instructions: [],
    description: null,
    notes: null,
    imageUrl: '',
    rating: null,
    flags: null,
    timesRated: 0,
    timesViewed: 0,
    tags: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z')
};

const buildFakeRepository = (
    overrides: Partial<RecipeRepository> = {}
): RecipeRepository => ({
    getById: vi.fn().mockResolvedValue(fixtureRecipe),
    getByDisplayId: vi.fn().mockResolvedValue(fixtureRecipe),
    list: vi.fn().mockResolvedValue([]),
    search: vi.fn().mockResolvedValue([]),
    listByUser: vi.fn().mockResolvedValue([]),
    searchByUser: vi.fn().mockResolvedValue([]),
    filter: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue(fixtureRecipe),
    update: vi.fn().mockResolvedValue(fixtureRecipe),
    delete: vi.fn().mockResolvedValue(undefined),
    rate: vi.fn().mockResolvedValue(undefined),
    registerVisit: vi.fn().mockResolvedValue(undefined),
    submitAppeal: vi.fn(),
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

describe('useRecipeById', () => {
    it('returns the recipe from the injected repository', async () => {
        const repo = buildFakeRepository();
        const wrapper = buildWrapper({
            recipeRepository: repo,
            userRepository: buildEmptyRepository<UserRepository>(),
            authRepository: buildEmptyRepository<AuthRepository>(),
            fileRepository: buildEmptyRepository<FileRepository>(),
            ingredientRepository: buildEmptyRepository<IngredientRepository>()
        });

        const { result } = renderHook(
            () => recipeQueryClient.useRecipeById('42'),
            {
                wrapper
            }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(repo.getById).toHaveBeenCalledTimes(1);
        expect(repo.getById).toHaveBeenCalledWith(
            expect.objectContaining({
                id: '42',
                signal: expect.any(AbortSignal)
            })
        );
        expect(result.current.data).toBe(fixtureRecipe);
    });

    it('does not fetch when id is falsy', () => {
        const repo = buildFakeRepository();
        const wrapper = buildWrapper({
            recipeRepository: repo,
            userRepository: buildEmptyRepository<UserRepository>(),
            authRepository: buildEmptyRepository<AuthRepository>(),
            fileRepository: buildEmptyRepository<FileRepository>(),
            ingredientRepository: buildEmptyRepository<IngredientRepository>()
        });

        renderHook(() => recipeQueryClient.useRecipeById(''), { wrapper });

        expect(repo.getById).not.toHaveBeenCalled();
    });
});
