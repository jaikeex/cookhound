// @vitest-environment jsdom

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DataProvider, type Repositories } from '@/client/data';
import type { AdminRepository } from '@/client/data/admin/port';
import type { AuthRepository } from '@/client/data/auth/port';
import type { ContactRepository } from '@/client/data/contact/port';
import type { FileRepository } from '@/client/data/file/port';
import type { UserRepository } from '@/client/data/user/port';
import type { RecipeRepository } from '@/client/data/recipe/port';
import type { IngredientRepository } from '@/client/data/ingredient/port';
import type { TagRepository } from '@/client/data/tag/port';
import { buildEmptyRepository } from '@/client/data/__testing__/buildEmptyRepository';
import type { User } from '@/common/types';
import { AuthType, Status, UserRole } from '@/common/types';
import { authQueryClient } from '@/client/data/auth';

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

const buildFakeAuthRepository = (
    overrides: Partial<AuthRepository> = {}
): AuthRepository => ({
    getCurrentUser: vi.fn().mockResolvedValue(fixtureUser),
    login: vi.fn().mockResolvedValue(fixtureUser),
    loginWithGoogleOauth: vi.fn().mockResolvedValue(fixtureUser),
    logout: vi.fn().mockResolvedValue(undefined),
    logoutAll: vi.fn().mockResolvedValue(undefined),
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

describe('useCurrentUser', () => {
    it('returns the user from the injected repository', async () => {
        const repo = buildFakeAuthRepository();
        const wrapper = buildWrapper({
            authRepository: repo,
            fileRepository: buildEmptyRepository<FileRepository>(),
            userRepository: buildEmptyRepository<UserRepository>(),
            recipeRepository: buildEmptyRepository<RecipeRepository>(),
            ingredientRepository: buildEmptyRepository<IngredientRepository>(),
            tagRepository: buildEmptyRepository<TagRepository>(),
            contactRepository: buildEmptyRepository<ContactRepository>(),
            adminRepository: buildEmptyRepository<AdminRepository>()
        });

        const { result } = renderHook(() => authQueryClient.useCurrentUser(), {
            wrapper
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(repo.getCurrentUser).toHaveBeenCalledTimes(1);
        expect(repo.getCurrentUser).toHaveBeenCalledWith(
            expect.objectContaining({
                signal: expect.any(AbortSignal)
            })
        );
        expect(result.current.data).toEqual(fixtureUser);
    });

    it('logs in via useLogin and resolves to the revived user', async () => {
        const repo = buildFakeAuthRepository();
        const wrapper = buildWrapper({
            authRepository: repo,
            fileRepository: buildEmptyRepository<FileRepository>(),
            userRepository: buildEmptyRepository<UserRepository>(),
            recipeRepository: buildEmptyRepository<RecipeRepository>(),
            ingredientRepository: buildEmptyRepository<IngredientRepository>(),
            tagRepository: buildEmptyRepository<TagRepository>(),
            contactRepository: buildEmptyRepository<ContactRepository>(),
            adminRepository: buildEmptyRepository<AdminRepository>()
        });

        const { result } = renderHook(() => authQueryClient.useLogin(), {
            wrapper
        });

        const data = await result.current.mutateAsync({
            email: 'tester@example.com',
            password: 'pw',
            keepLoggedIn: true
        });

        // react-query v5 passes a second context arg to the mutationFn spy
        // ({ client, meta, mutationKey }). Assert only the variables.
        expect(vi.mocked(repo.login).mock.calls[0]?.[0]).toEqual({
            email: 'tester@example.com',
            password: 'pw',
            keepLoggedIn: true
        });
        expect(data).toEqual(fixtureUser);
    });
});
