// @vitest-environment jsdom

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DataProvider, type Repositories } from '@/client/data';
import type { UserRepository } from '@/client/data/user/port';
import { buildEmptyRepository } from '@/client/data/__testing__/buildEmptyRepository';
import type { User } from '@/common/types';
import { AuthType, Status, UserRole } from '@/common/types';
import { userQueryClient } from '@/client/data/user';
import type { RecipeRepository } from '@/client/data/recipe/port';
import type { AuthRepository } from '@/client/data/auth/port';
import type { FileRepository } from '@/client/data/file/port';
import type { IngredientRepository } from '@/client/data/ingredient/port';
import type { TagRepository } from '@/client/data/tag/port';
import type { ContactRepository } from '@/client/data/contact/port';
import type { AdminRepository } from '@/client/data/admin/port';
import type { CookbookRepository } from '@/client/data/cookbook/port';

const fixtureUser: User = {
    id: 42,
    username: 'tester',
    avatarUrl: null,
    email: 'tester@example.com',
    preferences: {},
    role: UserRole.User,
    status: Status.Active,
    authType: AuthType.Local,
    createdAt: new Date('2026-01-01T00:00:00Z')
};

const buildFakeUserRepository = (
    overrides: Partial<UserRepository> = {}
): UserRepository => ({
    getById: vi.fn().mockResolvedValue(fixtureUser),
    create: vi.fn().mockResolvedValue(fixtureUser),
    update: vi.fn().mockResolvedValue(fixtureUser),
    getShoppingList: vi.fn().mockResolvedValue([]),
    upsertShoppingList: vi.fn().mockResolvedValue([]),
    updateShoppingList: vi.fn().mockResolvedValue([]),
    deleteShoppingList: vi.fn().mockResolvedValue(undefined),
    getLastViewedRecipes: vi.fn().mockResolvedValue([]),
    createCookieConsent: vi.fn(),
    updatePreferences: vi.fn().mockResolvedValue(undefined),
    initiateEmailChange: vi.fn().mockResolvedValue(undefined),
    confirmEmailChange: vi.fn().mockResolvedValue(fixtureUser),
    verifyEmail: vi.fn().mockResolvedValue(undefined),
    resendVerificationEmail: vi.fn().mockResolvedValue(undefined),
    sendResetPasswordEmail: vi.fn().mockResolvedValue(undefined),
    resetPassword: vi.fn().mockResolvedValue(undefined),
    initiateAccountDeletion: vi.fn(),
    cancelAccountDeletion: vi.fn().mockResolvedValue(undefined),
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

describe('useGetUserById', () => {
    it('returns the user from the injected repository', async () => {
        const repo = buildFakeUserRepository();
        const wrapper = buildWrapper({
            userRepository: repo,
            recipeRepository: buildEmptyRepository<RecipeRepository>(),
            authRepository: buildEmptyRepository<AuthRepository>(),
            fileRepository: buildEmptyRepository<FileRepository>(),
            ingredientRepository: buildEmptyRepository<IngredientRepository>(),
            tagRepository: buildEmptyRepository<TagRepository>(),
            contactRepository: buildEmptyRepository<ContactRepository>(),
            adminRepository: buildEmptyRepository<AdminRepository>(),
            cookbookRepository: buildEmptyRepository<CookbookRepository>()
        });

        const { result } = renderHook(
            () => userQueryClient.useGetUserById(42),
            { wrapper }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(repo.getById).toHaveBeenCalledTimes(1);
        expect(repo.getById).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 42,
                signal: expect.any(AbortSignal)
            })
        );
        expect(result.current.data).toEqual(fixtureUser);
    });

    it('does not fetch when userId is falsy', async () => {
        const repo = buildFakeUserRepository();
        const wrapper = buildWrapper({
            userRepository: repo,
            recipeRepository: buildEmptyRepository<RecipeRepository>(),
            authRepository: buildEmptyRepository<AuthRepository>(),
            fileRepository: buildEmptyRepository<FileRepository>(),
            ingredientRepository: buildEmptyRepository<IngredientRepository>(),
            tagRepository: buildEmptyRepository<TagRepository>(),
            contactRepository: buildEmptyRepository<ContactRepository>(),
            adminRepository: buildEmptyRepository<AdminRepository>(),
            cookbookRepository: buildEmptyRepository<CookbookRepository>()
        });

        renderHook(() => userQueryClient.useGetUserById(0), { wrapper });

        // Hold the negative across a tick so an effect-deferred fetch would
        // surface as a regression rather than silently passing.
        await waitFor(() => {
            expect(repo.getById).not.toHaveBeenCalled();
        });
    });
});
