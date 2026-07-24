import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConflictError, NotFoundError, ValidationError } from '@/server/error';
import { ReportReason, ReportTargetType } from '@/common/constants';
import { ReportStatus } from '@/common/types';

//|=============================================================================================|//
//$                                           MOCKS                                             $//
//|=============================================================================================|//

//? vitest mocks need to be hoisted to the top, it throws otherwise

vi.mock('@/server/db/model', () => ({
    default: {
        contentReport: {
            getOpenByReporterAndTarget: vi.fn(),
            createReport: vi.fn(),
            getOneById: vi.fn(),
            updateStatus: vi.fn(),
            countOpen: vi.fn()
        },
        recipe: { getOneById: vi.fn() },
        cookbook: { getOneById: vi.fn() },
        user: { getOneById: vi.fn() }
    }
}));

vi.mock('@/server/utils/reqwest/guards', () => ({
    assertAuthenticated: vi.fn(() => 7),
    assertAdmin: vi.fn(() => 99)
}));

vi.mock('@/server/services/mail/service', () => ({
    mailService: {
        sendReportReceipt: vi.fn(),
        sendAdminReportNotification: vi.fn(),
        sendReportDecision: vi.fn()
    }
}));

vi.mock('@/server/services/notification/service', () => ({
    notificationService: {
        notifyContentReported: vi.fn()
    }
}));

vi.mock('@/server/services/cookbook/utils', () => ({
    canViewCookbook: vi.fn(() => true)
}));

//|=============================================================================================|//
//$                                          IMPORTS                                            $//
//|=============================================================================================|//

const REPORTER_ID = 7;

import { contentReportService } from './service';
import db from '@/server/db/model';
import { mailService } from '@/server/services/mail/service';
import { notificationService } from '@/server/services/notification/service';
import { canViewCookbook } from '@/server/services/cookbook/utils';

const mockContentReport = vi.mocked(db.contentReport);
const mockRecipe = vi.mocked(db.recipe);
const mockCookbook = vi.mocked(db.cookbook);
const mockUser = vi.mocked(db.user);
const mockMail = vi.mocked(mailService);
const mockNotify = vi.mocked(notificationService);
const mockCanViewCookbook = vi.mocked(canViewCookbook);

const buildCreatedRow = (
    overrides: Record<string, unknown> = {}
): Record<string, unknown> => ({
    id: 1,
    reporterId: REPORTER_ID,
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
    createdAt: new Date('2026-07-24T00:00:00Z'),
    ...overrides
});

//|=============================================================================================|//
//$                                           TESTS                                             $//
//|=============================================================================================|//

describe('ContentReportService.createReport', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('rejects a user reporting their own profile', async () => {
        await expect(
            contentReportService.createReport({
                targetType: ReportTargetType.USER,
                targetId: REPORTER_ID,
                reason: ReportReason.HARASSMENT
            })
        ).rejects.toThrow(ValidationError);

        expect(mockContentReport.createReport).not.toHaveBeenCalled();
    });

    it('rejects a report whose target does not exist', async () => {
        mockRecipe.getOneById.mockResolvedValue(null as never);

        await expect(
            contentReportService.createReport({
                targetType: ReportTargetType.RECIPE,
                targetId: 42,
                reason: ReportReason.SPAM
            })
        ).rejects.toThrow(NotFoundError);

        expect(mockContentReport.createReport).not.toHaveBeenCalled();
    });

    it('does not resolve a flag-hidden recipe (no title leak)', async () => {
        mockRecipe.getOneById.mockResolvedValue({
            title: 'Hidden recipe',
            displayId: 'abc123',
            flags: [{ active: true }]
        } as never);

        await expect(
            contentReportService.createReport({
                targetType: ReportTargetType.RECIPE,
                targetId: 42,
                reason: ReportReason.SPAM
            })
        ).rejects.toThrow(NotFoundError);

        expect(mockContentReport.createReport).not.toHaveBeenCalled();
    });

    it('does not resolve a cookbook the reporter cannot view', async () => {
        mockCookbook.getOneById.mockResolvedValue({
            title: 'Private book',
            displayId: 'cb123',
            ownerId: 999,
            visibility: 'PRIVATE'
        } as never);
        mockCanViewCookbook.mockReturnValue(false);

        await expect(
            contentReportService.createReport({
                targetType: ReportTargetType.COOKBOOK,
                targetId: 8,
                reason: ReportReason.SPAM
            })
        ).rejects.toThrow(NotFoundError);

        expect(mockContentReport.createReport).not.toHaveBeenCalled();
    });

    it('rejects a duplicate open report on the same target', async () => {
        mockRecipe.getOneById.mockResolvedValue({
            title: 'Svíčková',
            displayId: 'abc123'
        } as never);
        mockContentReport.getOpenByReporterAndTarget.mockResolvedValue({
            id: 5
        } as never);

        await expect(
            contentReportService.createReport({
                targetType: ReportTargetType.RECIPE,
                targetId: 42,
                reason: ReportReason.SPAM
            })
        ).rejects.toThrow(ConflictError);

        expect(mockContentReport.createReport).not.toHaveBeenCalled();
    });

    it('maps an insert unique-violation race to the duplicate conflict', async () => {
        mockRecipe.getOneById.mockResolvedValue({
            title: 'Svíčková',
            displayId: 'abc123'
        } as never);
        // Pre-check passes (the racing request had not yet committed)...
        mockContentReport.getOpenByReporterAndTarget.mockResolvedValue(
            null as never
        );
        // ...but the partial unique index rejects the insert. The prisma client
        // extension wraps it as an InfrastructureError with the raw P2002 cause.
        mockContentReport.createReport.mockRejectedValue({
            code: 'DB_CONSTRAINT_VIOLATION',
            cause: {
                code: 'P2002',
                meta: { target: 'content_reports_one_open_per_target' }
            }
        } as never);

        await expect(
            contentReportService.createReport({
                targetType: ReportTargetType.RECIPE,
                targetId: 42,
                reason: ReportReason.SPAM
            })
        ).rejects.toThrow(ConflictError);

        expect(mockContentReport.createReport).toHaveBeenCalledTimes(1);
        // No receipt email for a rejected duplicate.
        expect(mockMail.sendReportReceipt).not.toHaveBeenCalled();
    });

    it('persists the report, snapshots the target, and fires receipt + admin + ntfy', async () => {
        mockRecipe.getOneById.mockResolvedValue({
            title: 'Svíčková',
            displayId: 'abc123'
        } as never);
        mockContentReport.getOpenByReporterAndTarget.mockResolvedValue(
            null as never
        );
        mockContentReport.createReport.mockResolvedValue(
            buildCreatedRow() as never
        );
        mockUser.getOneById.mockResolvedValue({
            email: 'bob@example.com',
            username: 'bob'
        } as never);

        const dto = await contentReportService.createReport({
            targetType: ReportTargetType.RECIPE,
            targetId: 42,
            reason: ReportReason.HARASSMENT,
            details: '  something wrong  '
        });

        // Target label + url are snapshotted from the resolved recipe.
        expect(mockContentReport.createReport).toHaveBeenCalledWith(
            expect.objectContaining({
                reporterId: REPORTER_ID,
                targetType: ReportTargetType.RECIPE,
                targetId: 42,
                targetLabel: 'Svíčková',
                targetUrl: '/recept/abc123/svickova',
                reason: ReportReason.HARASSMENT,
                details: 'something wrong'
            })
        );

        expect(mockMail.sendReportReceipt).toHaveBeenCalledWith(
            'bob@example.com',
            'bob',
            'Svíčková'
        );
        expect(mockMail.sendAdminReportNotification).toHaveBeenCalledTimes(1);
        expect(mockNotify.notifyContentReported).toHaveBeenCalledTimes(1);

        expect(dto.id).toBe(1);
        expect(dto.reporterUsername).toBe('bob');
        expect(dto.status).toBe(ReportStatus.PENDING);
        expect(dto.createdAt).toBe('2026-07-24T00:00:00.000Z');
    });
});

describe('ContentReportService.resolveReport', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('refuses to re-resolve an already-terminal report', async () => {
        mockContentReport.getOneById.mockResolvedValue(
            buildCreatedRow({
                status: ReportStatus.ACTIONED,
                reporter: { username: 'bob' }
            }) as never
        );

        await expect(
            contentReportService.resolveReport(
                1,
                ReportStatus.DISMISSED,
                'changed my mind'
            )
        ).rejects.toThrow(ConflictError);

        // The original decision is preserved and no second email is sent.
        expect(mockContentReport.updateStatus).not.toHaveBeenCalled();
        expect(mockMail.sendReportDecision).not.toHaveBeenCalled();
    });

    it('resolves a pending report and emails the reporter a decision', async () => {
        mockContentReport.getOneById.mockResolvedValue(
            buildCreatedRow({
                status: ReportStatus.PENDING,
                reporter: { username: 'bob' }
            }) as never
        );
        mockContentReport.updateStatus.mockResolvedValue(
            buildCreatedRow({ status: ReportStatus.ACTIONED }) as never
        );
        mockUser.getOneById.mockResolvedValue({
            email: 'bob@example.com',
            username: 'bob'
        } as never);

        await contentReportService.resolveReport(
            1,
            ReportStatus.ACTIONED,
            '  spam confirmed  '
        );

        expect(mockContentReport.updateStatus).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                status: ReportStatus.ACTIONED,
                reviewedById: 99,
                resolution: 'spam confirmed'
            })
        );
        expect(mockMail.sendReportDecision).toHaveBeenCalledWith(
            'bob@example.com',
            'bob',
            expect.objectContaining({ upheld: true })
        );
    });
});
