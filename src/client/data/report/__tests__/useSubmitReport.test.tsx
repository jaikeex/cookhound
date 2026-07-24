// @vitest-environment jsdom

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DataProvider, type Repositories } from '@/client/data';
import type { AdminRepository } from '@/client/data/admin/port';
import type { CookbookRepository } from '@/client/data/cookbook/port';
import type { RecipeRepository } from '@/client/data/recipe/port';
import type { ReportRepository } from '@/client/data/report/port';
import type { UserRepository } from '@/client/data/user/port';
import type { AuthRepository } from '@/client/data/auth/port';
import type { ContactRepository } from '@/client/data/contact/port';
import type { FileRepository } from '@/client/data/file/port';
import type { IngredientRepository } from '@/client/data/ingredient/port';
import type { TagRepository } from '@/client/data/tag/port';
import { buildEmptyRepository } from '@/client/data/__testing__/buildEmptyRepository';
import { ReportReason, ReportTargetType } from '@/common/constants';
import { ReportStatus, type ContentReportDTO } from '@/common/types';
import { reportQueryClient } from '@/client/data/report';

const fixtureReport: ContentReportDTO = {
    id: 1,
    reporterId: 7,
    reporterUsername: 'bob',
    targetType: ReportTargetType.RECIPE,
    targetId: 42,
    targetLabel: 'Svíčková',
    targetUrl: '/recept/abc123/svickova',
    reason: ReportReason.HARASSMENT,
    details: null,
    status: ReportStatus.PENDING,
    reviewedById: null,
    reviewedAt: null,
    resolution: null,
    createdAt: '2026-07-24T00:00:00.000Z'
};

const buildWrapper = (repositories: Repositories) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false }
        }
    });
    return ({ children }: Readonly<{ children: React.ReactNode }>) => (
        <QueryClientProvider client={queryClient}>
            <DataProvider value={repositories}>{children}</DataProvider>
        </QueryClientProvider>
    );
};

describe('useSubmitReport', () => {
    it('submits the report payload through the injected repository', async () => {
        const submit = vi.fn().mockResolvedValue(fixtureReport);
        const reportRepo: ReportRepository = { submit };

        const wrapper = buildWrapper({
            reportRepository: reportRepo,
            recipeRepository: buildEmptyRepository<RecipeRepository>(),
            userRepository: buildEmptyRepository<UserRepository>(),
            authRepository: buildEmptyRepository<AuthRepository>(),
            fileRepository: buildEmptyRepository<FileRepository>(),
            ingredientRepository: buildEmptyRepository<IngredientRepository>(),
            tagRepository: buildEmptyRepository<TagRepository>(),
            contactRepository: buildEmptyRepository<ContactRepository>(),
            adminRepository: buildEmptyRepository<AdminRepository>(),
            cookbookRepository: buildEmptyRepository<CookbookRepository>()
        });

        const { result } = renderHook(
            () => reportQueryClient.useSubmitReport(),
            { wrapper }
        );

        const payload = {
            targetType: ReportTargetType.RECIPE,
            targetId: 42,
            reason: ReportReason.HARASSMENT
        };

        result.current.mutate(payload);

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(submit).toHaveBeenCalledTimes(1);
        // react-query passes a context object as a second arg; assert the
        // payload the hook forwarded, not the incidental extras.
        expect(submit.mock.calls[0]?.[0]).toEqual(payload);
        expect(result.current.data).toEqual(fixtureReport);
    });
});
