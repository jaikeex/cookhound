import { ConflictError, NotFoundError, ValidationError } from '@/server/error';
import { ApplicationErrorCode } from '@/server/error/codes';
import { Logger, LogServiceMethod } from '@/server/logger';
import {
    assertAdmin,
    assertAuthenticated
} from '@/server/utils/reqwest/guards';
import db from '@/server/db/model';
import type { ContentReportWithReporter } from '@/server/types/reports';
import type { ContentReport } from '@/server/db/generated/prisma/client';
import {
    ANONYMOUS_USER_ID,
    ROUTES,
    ReportReason,
    ReportTargetType
} from '@/common/constants';
import {
    ReportStatus,
    type ContentReportDTO,
    type ContentReportListDTO,
    type ReportPayload
} from '@/common/types/reports/report';
import { mailService } from '@/server/services/mail/service';
import { notificationService } from '@/server/services/notification/service';
import { canViewCookbook } from '@/server/services/cookbook/utils';
import { isOpenReportCollision } from './utils';
import type { ResolvedTarget } from './types';

//|=============================================================================================|//

const LOG_CONTEXT = 'content-report-service';
const log = Logger.getInstance(LOG_CONTEXT);

const DECISION_STATUS: readonly ReportStatus[] = [
    ReportStatus.ACTIONED,
    ReportStatus.DISMISSED
];

/**
 * Manages user-submitted content reports and the admin moderation decisions filed against them.
 */
class ContentReportService {
    static readonly LOG_CONTEXT = LOG_CONTEXT;

    //~=========================================================================================~//
    //$                                       REPORTER FLOW                                     $//
    //~=========================================================================================~//

    /**
     * Files a new report on behalf of the authenticated caller.
     *
     * Enforces, in order: the target exists; a user cannot report their own
     * profile; and the caller has no open report against the same target.
     * The target label and url are snapshotted onto the report so the record
     * survives later edits or deletion of the content.
     *
     * @param payload - Target coordinates, reason, and optional freetext detail.
     * @returns The persisted report.
     * @throws {ValidationError} Unknown target type, or self-report of a profile.
     * @throws {NotFoundError} If the reported target does not exist.
     * @throws {ConflictError} If the caller already has an open report on it.
     */
    @LogServiceMethod()
    async createReport(payload: ReportPayload): Promise<ContentReportDTO> {
        const reporterId = assertAuthenticated();

        const { targetType, targetId, reason } = payload;
        const details = payload.details?.trim() || null;

        if (targetType === ReportTargetType.USER && targetId === reporterId) {
            log.info('createReport - self report rejected', { reporterId });
            throw new ValidationError(
                'report.error.self-report',
                ApplicationErrorCode.REPORT_SELF_NOT_ALLOWED
            );
        }

        const target = await this.resolveTarget(targetType, targetId);

        const existingOpen = await db.contentReport.getOpenByReporterAndTarget(
            reporterId,
            targetType,
            targetId
        );

        if (existingOpen) {
            log.info('createReport - open report already exists', {
                reporterId,
                targetType,
                targetId,
                existingReportId: existingOpen.id
            });

            throw new ConflictError(
                'report.error.already-reported',
                ApplicationErrorCode.REPORT_ALREADY_PENDING
            );
        }

        // The getOpenByReporterAndTarget check above is the fast path for the
        // common case; the partial unique index is the race backstop. Two
        // concurrent submissions can both pass the check, so translate the
        // resulting unique-violation into the same duplicate conflict.
        let report: ContentReport;

        try {
            report = await db.contentReport.createReport({
                reporterId,
                targetType,
                targetId,
                targetLabel: target.label,
                targetUrl: target.url,
                reason,
                details
            });
        } catch (error: unknown) {
            if (isOpenReportCollision(error)) {
                log.info('createReport - lost open-report insert race', {
                    reporterId,
                    targetType,
                    targetId
                });

                throw new ConflictError(
                    'report.error.already-reported',
                    ApplicationErrorCode.REPORT_ALREADY_PENDING
                );
            }

            throw error;
        }

        const reporter = await db.user.getOneById(reporterId, {
            email: true,
            username: true
        });

        if (reporter) {
            try {
                await mailService.sendReportReceipt(
                    reporter.email,
                    reporter.username,
                    target.label
                );
            } catch (error: unknown) {
                log.warn('createReport - failed to enqueue receipt email', {
                    error,
                    reportId: report.id
                });
            }
        }

        try {
            await mailService.sendAdminReportNotification({
                reportId: report.id,
                targetType,
                targetLabel: target.label,
                targetUrl: target.url,
                reason,
                details: details ?? '',
                reporterId
            });
        } catch (error: unknown) {
            log.warn('createReport - failed to enqueue admin notification', {
                error,
                reportId: report.id
            });
        }

        notificationService.notifyContentReported({
            reportId: report.id,
            targetType,
            targetLabel: target.label,
            reason
        });

        return this.createDTO(report, reporter?.username ?? null);
    }

    //~=========================================================================================~//
    //$                                        ADMIN FLOW                                       $//
    //~=========================================================================================~//

    /**
     * Returns a paginated, filterable page of reports for the moderation queue.
     *
     * @param options - Pagination and optional filters.
     */
    @LogServiceMethod({ names: ['page', 'pageSize', 'status', 'targetType'] })
    async listReports(options: {
        page: number;
        pageSize: number;
        status?: string;
        targetType?: string;
    }): Promise<ContentReportListDTO> {
        assertAdmin();

        const { reports, total } = await db.contentReport.getMany(options);

        return {
            reports: reports.map((report) =>
                this.createDTO(report, report.reporter?.username ?? null)
            ),
            totalItems: total,
            page: options.page,
            pageSize: options.pageSize
        };
    }

    /**
     * Returns a single report for the admin detail view.
     *
     * @param id - id of the report.
     * @throws {NotFoundError} If the report does not exist.
     */
    @LogServiceMethod({ names: ['id'] })
    async getReportById(id: number): Promise<ContentReportDTO> {
        assertAdmin();

        const report = await this.requireReport(id);

        return this.createDTO(report, report.reporter?.username ?? null);
    }

    /**
     * Records a moderation decision on a report.
     *
     * @param id - id of the report.
     * @param status - The new status to set.
     * @param resolution - Optional moderator note included in the decision email.
     * @throws {NotFoundError} If the report does not exist.
     */
    @LogServiceMethod({ names: ['id', 'status'] })
    async resolveReport(
        id: number,
        status: ReportStatus,
        resolution?: string
    ): Promise<ContentReportDTO> {
        const adminId = assertAdmin();

        const report = await this.requireReport(id);

        // A terminal report is final. Resolving it would overwrite the
        // original decision and, on a terminal target status, re-send the
        // reporter a duplicate email.
        if (DECISION_STATUS.includes(report.status as ReportStatus)) {
            log.info('resolveReport - report already resolved', {
                reportId: id,
                status: report.status
            });
            throw new ConflictError(
                'report.error.already-resolved',
                ApplicationErrorCode.REPORT_ALREADY_RESOLVED
            );
        }

        const trimmedResolution = resolution?.trim() || null;

        const updated = await db.contentReport.updateStatus(id, {
            status,
            reviewedById: adminId,
            reviewedAt: new Date(),
            resolution: trimmedResolution
        });

        if (
            DECISION_STATUS.includes(status) &&
            report.reporterId !== ANONYMOUS_USER_ID
        ) {
            const reporter = await db.user.getOneById(report.reporterId, {
                email: true,
                username: true
            });

            if (reporter) {
                try {
                    await mailService.sendReportDecision(
                        reporter.email,
                        reporter.username,
                        {
                            targetLabel: report.targetLabel,
                            upheld: status === ReportStatus.ACTIONED,
                            resolution: trimmedResolution ?? ''
                        }
                    );
                } catch (error: unknown) {
                    log.warn(
                        'resolveReport - failed to enqueue decision email',
                        { error, reportId: id }
                    );
                }
            }
        }

        return this.createDTO(updated, report.reporter?.username ?? null);
    }

    //~=========================================================================================~//
    //$                                        HELPERS                                          $//
    //~=========================================================================================~//

    /**
     * Fetches a report with its reporter.
     */
    private async requireReport(
        id: number
    ): Promise<ContentReportWithReporter> {
        const report = await db.contentReport.getOneById(id);

        if (!report) {
            throw new NotFoundError(
                'report.error.not-found',
                ApplicationErrorCode.REPORT_NOT_FOUND
            );
        }

        return report;
    }

    /**
     * Resolves a report target to a display label, verifying it exists and is
     * visible to the caller.
     *
     * @throws {ValidationError} If the target type is not recognised.
     * @throws {NotFoundError} If the target does not exist or is not visible.
     */
    private async resolveTarget(
        targetType: string,
        targetId: number
    ): Promise<ResolvedTarget> {
        switch (targetType) {
            case ReportTargetType.RECIPE: {
                const recipe = await db.recipe.getOneById(targetId);

                if (!recipe) {
                    break;
                }

                const flags = recipe.flags as ReadonlyArray<{
                    active: boolean;
                }> | null;

                if (flags?.some((flag) => flag.active)) {
                    break;
                }

                return {
                    label: recipe.title,
                    url: ROUTES.recipe.detail(recipe.displayId, recipe.title)
                };
            }
            case ReportTargetType.COOKBOOK: {
                const cookbook = await db.cookbook.getOneById(targetId);

                if (!cookbook) {
                    break;
                }

                // Private cookbooks are invisible to non-owners.
                if (!canViewCookbook(cookbook)) {
                    break;
                }

                return {
                    label: cookbook.title,
                    url: ROUTES.cookbook.detail(cookbook.displayId)
                };
            }
            case ReportTargetType.USER: {
                const user = await db.user.getOneById(targetId, {
                    id: true,
                    username: true
                });

                if (!user) {
                    break;
                }

                return {
                    label: user.username,
                    url: ROUTES.user.detail(user.id)
                };
            }
            default:
                throw new ValidationError(
                    'report.error.invalid-target',
                    ApplicationErrorCode.VALIDATION_FAILED
                );
        }

        // target type was recognised but the row does not exist.
        log.info('resolveTarget - target not found', { targetType, targetId });

        throw new NotFoundError(
            'report.error.target-not-found',
            ApplicationErrorCode.REPORT_TARGET_NOT_FOUND
        );
    }

    private createDTO(
        report: ContentReport,
        reporterUsername: string | null
    ): ContentReportDTO {
        return {
            id: report.id,
            reporterId: report.reporterId,
            reporterUsername,
            targetType: report.targetType as ReportTargetType,
            targetId: report.targetId,
            targetLabel: report.targetLabel,
            targetUrl: report.targetUrl,
            reason: report.reason as ReportReason,
            details: report.details,
            status: report.status as ReportStatus,
            reviewedById: report.reviewedById,
            reviewedAt: report.reviewedAt
                ? report.reviewedAt.toISOString()
                : null,
            resolution: report.resolution,
            createdAt: report.createdAt.toISOString()
        };
    }
}

export const contentReportService = new ContentReportService();
