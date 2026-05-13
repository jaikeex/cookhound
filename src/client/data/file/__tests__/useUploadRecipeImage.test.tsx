// @vitest-environment jsdom

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DataProvider, type Repositories } from '@/client/data';
import type { AdminRepository } from '@/client/data/admin/port';
import type { CookbookRepository } from '@/client/data/cookbook/port';
import type { FileRepository } from '@/client/data/file/port';
import type { IngredientRepository } from '@/client/data/ingredient/port';
import type { RecipeRepository } from '@/client/data/recipe/port';
import type { UserRepository } from '@/client/data/user/port';
import type { AuthRepository } from '@/client/data/auth/port';
import type { TagRepository } from '@/client/data/tag/port';
import type { ContactRepository } from '@/client/data/contact/port';
import { buildEmptyRepository } from '@/client/data/__testing__/buildEmptyRepository';
import type { FileForUpload, FileUploadResponse } from '@/common/types';
import { fileQueryClient } from '@/client/data/file';

const fixtureUpload: FileForUpload = {
    fileName: 'photo.png',
    file: new File(['x'], 'photo.png', { type: 'image/png' })
};

const fixtureResponse: FileUploadResponse = {
    objectUrl: 'https://cdn.test/photo.png'
};

const buildFakeFileRepository = (
    overrides: Partial<FileRepository> = {}
): FileRepository => ({
    uploadRecipeImage: vi.fn().mockResolvedValue(fixtureResponse),
    uploadAvatarImage: vi.fn().mockResolvedValue(fixtureResponse),
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

describe('fileQueryClient', () => {
    it('uploads a recipe image via the injected repository', async () => {
        const repo = buildFakeFileRepository();
        const wrapper = buildWrapper({
            fileRepository: repo,
            ingredientRepository: buildEmptyRepository<IngredientRepository>(),
            recipeRepository: buildEmptyRepository<RecipeRepository>(),
            userRepository: buildEmptyRepository<UserRepository>(),
            authRepository: buildEmptyRepository<AuthRepository>(),
            tagRepository: buildEmptyRepository<TagRepository>(),
            contactRepository: buildEmptyRepository<ContactRepository>(),
            adminRepository: buildEmptyRepository<AdminRepository>(),
            cookbookRepository: buildEmptyRepository<CookbookRepository>()
        });

        const { result } = renderHook(
            () => fileQueryClient.useUploadRecipeImage(),
            { wrapper }
        );

        result.current.mutate(fixtureUpload);

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(repo.uploadRecipeImage).toHaveBeenCalledTimes(1);
        // react-query v5 passes a second context arg to the mutationFn spy
        // (`{ client, meta, mutationKey }`). Only the first arg — the
        // variables — is meaningful here.
        expect(vi.mocked(repo.uploadRecipeImage).mock.calls[0]?.[0]).toEqual(
            fixtureUpload
        );
        expect(result.current.data).toEqual(fixtureResponse);
    });

    it('uploads an avatar image via the injected repository', async () => {
        const repo = buildFakeFileRepository();
        const wrapper = buildWrapper({
            fileRepository: repo,
            ingredientRepository: buildEmptyRepository<IngredientRepository>(),
            recipeRepository: buildEmptyRepository<RecipeRepository>(),
            userRepository: buildEmptyRepository<UserRepository>(),
            authRepository: buildEmptyRepository<AuthRepository>(),
            tagRepository: buildEmptyRepository<TagRepository>(),
            contactRepository: buildEmptyRepository<ContactRepository>(),
            adminRepository: buildEmptyRepository<AdminRepository>(),
            cookbookRepository: buildEmptyRepository<CookbookRepository>()
        });

        const { result } = renderHook(
            () => fileQueryClient.useUploadAvatarImage(),
            { wrapper }
        );

        result.current.mutate(fixtureUpload);

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(repo.uploadAvatarImage).toHaveBeenCalledTimes(1);
        expect(vi.mocked(repo.uploadAvatarImage).mock.calls[0]?.[0]).toEqual(
            fixtureUpload
        );
        expect(result.current.data).toEqual(fixtureResponse);
    });
});
